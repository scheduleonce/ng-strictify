# ng-strictify

> Incrementally update your Angular project to use the Typescript strict flag

For a summary of the most recent changes to the project, please see [CHANGELOG](https://github.com/scheduleonce/ng-strictify/blob/master/CHANGELOG.md)

## Builder

This is a custom Angular CLI builder, which can be used to check Angular projects with a different tsconfig file and can help in enabling some tsconfig rules incrementally.

This repository contains an example of the Angular CLI Architect API.
You can find the Architect builder in the `builder` directory.

## What can you use this for ?

Having a project set to use Typescript's `strict` flag on is considered a [good practice](https://angular.io/guide/strict-mode). However, what if you have a large project that currently doesn't use the `strict` flag and you want to start using it ? For a lot of projects, just turning it on is not always feasible, as you would have to fix a lot of issues in one go. Having an _incremental_ migration plan is necessary then.

This builder fulfills these two main requirements:

1. Strictness should be enforced on already strict files.
2. New files should have strict flag enforced by default.

This will make sure you do not introduce new code that is not "strict" and will let you slowly update the existing non-strict files to be strict.

## Installation

```sh
$ npm install @oncehub/ng-strictify
```

## Adding to the project architect

```json
// angular.json
"app-name": {
    // ...
    "architect": {
        "build": {...},
        "serve": {...},
        // ...
        "strictify": {
            "builder": "@oncehub/ng-strictify:strictify",
            "options": {
                "command": "strictify",
                "buildScript": "build",
                "listFilesOnly": true           // Optional
            }
        }
    }
}
```

### Architect configuration explained

- **Build command:** strictify: To use with ng cli.
- **Builder:** "@oncehub/ng-strictify:strictify": Name of the CLI builder and its command to execute.
- **Options:**
  1. `command`: name of the command - Same as mentioned in builder.
  2. `buildScript`: Specify the build script mentioned in your package file. This script will be executed from within the ng-strictify builder.
  3. `listFilesOnly`: (_optional_) If true, ng-strictify will print the list of files with errors. You can use this to find out all the files that need to be excluded when you start the incremental migration.

## Add npm custom script in package.json

```json
"scripts": {
    // ...
    "strictify": "ng run app-name:strictify"
}
```

You need to pass the app-name and the build command for ng-strictify that you specified in the `angular.json` file.

## Adding a `tsconfig.strict.json` file

You must have a `tsconfig.strict.json` file present in your project folder to use ng-strictify. This file will be used as the base configuration in ng-strictify.

\* Note: In the test-app example in this repo we have only added strict rules, but you can also specify any rule which you want to enable in an incremental migration.

---

## Sample application

The sample application which uses the Architect builder is available under the `test-app` directory.

This sample application can be used to test the custom builder. We have added all the required configuration to run ng-strictify in that test app along with the `tsconfig.strict.json` file which has some strict rules enabled that are not enabled in the main tsconfig.

### Local development

#### Build the cli builder and generate the package

Go to the builder directory and execute the following commands

```
$ npm run build
$ npm link
```

#### Use the cli builder package from local

Go to the test-app directory and execute the following command

```
$ npm link @oncehub/ng-strictify
$ npm run strictify
```

### Observing the result

You can see the following result in the console after the command execution:

```
Fix these issues: src/app/app.component.ts:9:3 - error TS7008: Member 'title' implicitly has an 'any' type.

9   title;
    ~~~~~

```

As we can see that in `app.component.ts` file we have added a variable `title` without any type and later assigning a string to it. Since the default type of this variable is _any_ which is not allowed in the strict configuration our ng-strictify showing it as error.

Change the declaration of title variable as:

```
title: string = '';
```

And now re-run the `npm run strictify` command again. You will see that no error has been reproduced at this step.

