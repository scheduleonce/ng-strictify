import { BuilderOutput, createBuilder } from '@angular-devkit/architect';

import { parseErrors } from './error-parser';
import { executeBuildCommandInChild, getTsConfigPath, Options } from './helper';

export default createBuilder<Options>((options, context) => {
  return new Promise<BuilderOutput>((resolve, reject) => {
    const projectName = context.target ? context.target.project : '';
    context.getProjectMetadata(projectName).then((projectMetaData) => {
      const tsConfigPath = getTsConfigPath(projectMetaData);
      const buildProcess = executeBuildCommandInChild(options, tsConfigPath);

      // Handling if child process failed to start
      buildProcess.on('error', (error) => {
        console.log('Failed to start child process: ', error);
        reject(error);
      });

      // Handling stderr
      const stderrChunks: Uint8Array[] = [];
      let stderrStr = '';
      buildProcess.stderr.on('data', (data) => {
        stderrChunks.push(data);
      });

      buildProcess.stderr.on('end', () => {
        stderrStr = Buffer.concat(stderrChunks).toString();
      });

      buildProcess.on('close', (code, signal) => {
        console.log(
          `buildProcess was closed with with code: ${code} and signal: ${signal}`
        );
        if (code === 0) {
          console.log('Congratulations!!! No errors found');
          console.log('You can now remove the ng-strictify');

          resolve({ success: true });
          return;
        }

        parseErrors(
          stderrStr,
          context,
          tsConfigPath,
          projectMetaData,
          options,
          resolve,
          reject
        );
      });
    });
  });
});
