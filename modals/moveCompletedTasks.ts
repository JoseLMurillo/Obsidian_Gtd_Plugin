import { Notice, TFile, App } from 'obsidian';

export async function moveCompletedTasks(app: App) {
  const activeFile = app.workspace.getActiveFile();
  if (!activeFile) {
    new Notice('No active file open.');
    return;
  }

  const content = await app.vault.read(activeFile);
  const lines = content.split('\n');
  const completedTasks: string[] = [];

  // Filtra y elimina las tareas completadas del contenido original
  const newContent = lines.filter(line => {
    if (line.match(/- \[x\]/)) {
      completedTasks.push(line);
      return false;
    }
    return true;
  }).join('\n');

  // Busca la sección "# Done"
  const doneSectionIndex = newContent.indexOf('# Done');

  let updatedContent = '';
  if (doneSectionIndex !== -1) {
    // Añade las tareas completadas a la sección "# Done"
    const beforeDoneSection = newContent.substring(0, doneSectionIndex + 6);
    const afterDoneSection = newContent.substring(doneSectionIndex + 6);
    updatedContent = `${beforeDoneSection}\n${completedTasks.join('\n')}\n${afterDoneSection}`;
  } else {
    // Añade una nueva sección "# Done" al final del documento
    updatedContent = `${newContent}\n# Done\n${completedTasks.join('\n')}`;
  }

  await app.vault.modify(activeFile, updatedContent);
  new Notice('Completed tasks moved to # Done section.');
}