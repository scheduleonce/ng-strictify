import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

import {
  extractOnlyErrors,
  getAllErrors,
  getListOfFilesWithError,
  getStrictFilesWithError,
  listAllErrorsInStrictFiles,
  Options,
} from './helper';

export function parseErrors(
  error: string,
  context: BuilderContext,
  tsConfigPath: string,
  projectMetaData: JsonObject,
  options: Options,
  resolve: (value: BuilderOutput | PromiseLike<BuilderOutput>) => void,
  reject: (reason?: any) => void
) {
  try {
    const errorMessage = extractOnlyErrors(error);

    const listOfFilesWithError = getListOfFilesWithError(errorMessage);
    if (listOfFilesWithError.size === 0) {
      // Has different errors, need to report same
      console.log('These errors needs to be checked first: ');
      reject(error);
      return;
    }

    const strictFilesWithError = getStrictFilesWithError(
      context,
      tsConfigPath,
      listOfFilesWithError
    );
    if (strictFilesWithError.length === 0) {
      console.log('No errors found in strict enabled files');
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
  } catch (err) {
    reject(err);
  }
}
