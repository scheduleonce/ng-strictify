import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { exec } from 'child_process';

import {
  createBuildCommand,
  extractOnlyErrors,
  getAllErrors,
  getListOfFilesWithError,
  getStrictFilesWithError,
  getTsConfigPath,
  listAllErrorsInStrictFiles,
  Options,
} from './helper';

export default createBuilder<Options>((options, context) => {
  return new Promise<BuilderOutput>((resolve, reject) => {
    const projectName = context.target ? context.target.project : '';
    context.getProjectMetadata(projectName).then((projectMetaData) => {
      const tsConfigPath = getTsConfigPath(projectMetaData);
      const command = createBuildCommand(options, tsConfigPath);

      context.reportStatus(`Executing "${command}"...`);
      exec(command, (error) => {
        console.log('\n\n________________________________');
        if (error) {
          const errorMessage = extractOnlyErrors(error.message);

          const listOfFilesWithError = getListOfFilesWithError(errorMessage);
          if (listOfFilesWithError.size === 0) {
            // Has different errors, need to report same
            reject(error);
            return;
          }

          const strictFilesWithError = getStrictFilesWithError(
            context,
            tsConfigPath,
            listOfFilesWithError
          );
          if (strictFilesWithError.length === 0) {
            resolve({ success: true });
            return;
          }

          if (options.listFilesOnly) {
            reject(
              new Error(
                '\nFiles with issues: \n\n' +
                  strictFilesWithError.join(',\n') +
                  '\n\n'
              )
            );
            return;
          }

          const projectRoot = projectMetaData.root
            ? projectMetaData.root.toString()
            : '';
          const errorsArr = getAllErrors(errorMessage, projectRoot);
          const errorsInStrictFiles = listAllErrorsInStrictFiles(
            strictFilesWithError,
            errorsArr
          );
          reject(new Error('\nFix these issues: ' + errorsInStrictFiles));
          return;
        }
        resolve({ success: true });
        return;
      });
    });
  });
});