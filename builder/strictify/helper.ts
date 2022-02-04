import { BuilderContext } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { spawn } from 'child_process';

export interface Options extends JsonObject {
  command: string;
  buildScript: string;
  listFilesOnly: boolean;
}

export function executeBuildCommandInChild(
  options: Options,
  tsConfigPath: string
) {
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const buildProcess = spawn(cmd, [
    'run',
    `${options.buildScript}`,
    `--`,
    `--ts-config=${tsConfigPath}`,
  ]);
  return buildProcess;
}

export function getTsConfigPath(projectMetaData: JsonObject) {
  return projectMetaData.root
    ? projectMetaData.root + '/tsconfig.strict.json'
    : 'tsconfig.strict.json';
}

export function listAllErrorsInStrictFiles(
  strictFilesWithError: string[],
  errorsArr: string[]
) {
  let newErrorString = '';
  strictFilesWithError.forEach((file) => {
    const filtered = errorsArr.filter((error) => error.indexOf(file) !== -1);
    const combinedString = filtered.join('\n\n');
    newErrorString += combinedString;
  });

  return newErrorString;
}

export function extractOnlyErrors(errMessage: string) {
  const stopIndex = errMessage.indexOf('npm ERR! ');
  const startIndex = errMessage.indexOf('ERROR: ');
  if (startIndex === -1 || stopIndex === -1) {
    return errMessage;
  }
  return errMessage.substring(startIndex, stopIndex);
}

export function getAllErrors(errMessage: string, projectRoot: string) {
  const allIndices = findAllIndices(errMessage, projectRoot);
  const allErrors = [];
  for (let i = 0; i < allIndices.length - 1; i++) {
    const error = errMessage.substring(allIndices[i], allIndices[i + 1]);
    allErrors.push(error);
  }
  return allErrors;
}

function findAllIndices(errMessage: string, projectRoot: string) {
  const stopIndex = errMessage.length - 1;

  const regexStr = getErrorMatchingRegex(projectRoot);
  const regex = new RegExp(regexStr, 'g');

  const it = errMessage.matchAll(regex);
  const allIndices = [];
  let singleOccurrence = it.next();
  while (!singleOccurrence.done) {
    if (!!singleOccurrence.value && !!singleOccurrence.value.index) {
      allIndices.push(singleOccurrence.value.index);
    }
    singleOccurrence = it.next();
  }
  allIndices.push(stopIndex);
  return allIndices;
}

function getErrorMatchingRegex(projectRoot: string) {
  if (projectRoot) {
    projectRoot = projectRoot.replace(/\/$/, '');
    return `${projectRoot}/src`;
  }
  return 'src';
}

export function getListOfFilesWithError(errorMessage: string) {
  const allErrors = errorMessage.match(/src\/.*\.(ts|html)/g);
  if (allErrors) {
    allErrors.sort();
  }
  const listOfFilesWithError = new Set(allErrors);
  return listOfFilesWithError;
}

export function getStrictFilesWithError(
  context: BuilderContext,
  tsConfigPath: string,
  listOfFilesWithError: Set<string>
) {
  const tsConfig = require(`${context.currentDirectory}/${tsConfigPath}`);
  const filesToExclude = new Set<string>(tsConfig.exclude);

  const strictFilesWithError = compareErroneousFileWithFilesToExclude(
    listOfFilesWithError,
    filesToExclude
  );
  return strictFilesWithError;
}

function compareErroneousFileWithFilesToExclude(
  buggyFileList: Set<string>,
  filesToExclude: Set<string>
) {
  const newFilesToStrict = setDifference(filesToExclude, buggyFileList);
  if (newFilesToStrict.length > 0) {
    console.log('Remove these files from exclude list: ', newFilesToStrict);
  }
  const strictFilesWithError = setDifference(buggyFileList, filesToExclude);
  return strictFilesWithError;
}

function setDifference(aSet: Set<string>, bSet: Set<string>) {
  const list: string[] = [];
  aSet.forEach((a) => {
    if (!bSet.has(a)) {
      list.push(a);
    }
  });
  return list;
}
