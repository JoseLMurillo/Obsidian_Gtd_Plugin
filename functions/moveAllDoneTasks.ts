import { Notice, TFile, App } from 'obsidian';

export async function moveAllDoneTasks(app: App) {
  const targetFile = await getOrCreateFile(app, 'GTD/Tasks Done.md');
  const completedTasks: string[] = [];
  await processFolder(app, 'GTD', completedTasks);

  if (completedTasks.length === 0) {
    new Notice('No completed tasks found.');
    return;
  }

  const targetContent = await app.vault.read(targetFile);
  const updatedContent = `${targetContent}${completedTasks.join('\n')}`;
  await app.vault.modify(targetFile, updatedContent);

  new Notice('Completed tasks moved to target file.');
}

async function processFolder(app: App, folderPath: string, completedTasks: string[]) {
  const files = await app.vault.adapter.list(folderPath);

  for (const file of files.files) {
    const content = await app.vault.adapter.read(file);
    const lines = content.split('\n');
    lines.forEach((line) => {
      if (line.match(/- \[x\]/)) {
        completedTasks.push(line);
      }
    });

    // Remove completed tasks from original files
    const newContent = lines.filter(line => !line.match(/- \[x\]/)).join('\n');
    await app.vault.adapter.write(file, newContent);
  }

  for (const folder of files.folders) {
    await processFolder(app, folder, completedTasks);
  }
}

async function getOrCreateFile(app: App, filePath: string): Promise<TFile> {
  let file = app.vault.getAbstractFileByPath(filePath) as TFile;
  if (!file) {
    await app.vault.create(filePath, '');
    file = app.vault.getAbstractFileByPath(filePath) as TFile;
  }
  return file;
}
