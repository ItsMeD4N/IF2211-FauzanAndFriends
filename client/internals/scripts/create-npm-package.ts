import shell from 'shelljs';
import {
  createTemplateFolder,
  removeTemplateFolder,
} from './create-template-folder';
import { shellEnableAbortOnFail, shellDisableAbortOnFail } from './utils';

const packageFolder = '.cra-template-rb';
interface Options {}

export function createNpmPackage(opts: Options = {}) {
  const abortOnFailEnabled = shellEnableAbortOnFail();

  shell.rm('-rf', packageFolder);

  createTemplateFolder(opts);

  const archiveFilename = shell
    .exec(`npm pack`, { silent: true })
    .stdout.trim();

  shell.exec(`tar -xvf ${archiveFilename}`, { silent: true });
  shell.mv('package', packageFolder);
  shell.rm(archiveFilename);

  removeTemplateFolder();

  shell.mv(
    `${packageFolder}/template/npmrc`,
    `${packageFolder}/template/.npmrc`,
  );

  if (abortOnFailEnabled) shellDisableAbortOnFail();
  return packageFolder;
}

export function removeNpmPackage() {
  shell.rm('-rf', packageFolder);
}
