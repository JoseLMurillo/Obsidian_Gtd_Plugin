import { Modal, App, Notice } from 'obsidian'

export class TaskManagerModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Manage Tasks' });

    const folderPaths = ['GTD/1. Projects', 'GTD/2. Stay', 'GTD/3. Someday']; // Actualiza estas rutas con las carpetas específicas

    try {
      // Leer todas las tareas de las carpetas especificadas
      const tasks = await this.readTasksFromFolders(folderPaths);

      if (tasks.length === 0) {
        contentEl.createEl('p', { text: 'No tasks found.' });
        return;
      }

      tasks.forEach(task => {
        this.createTaskElement(task);
      });
    } catch (error) {
      console.error('Failed to read tasks:', error);
      contentEl.createEl('p', { text: 'Failed to load tasks.' });
    }
  }

  async readTasksFromFolders(folders: string[]): Promise<{ file: string; content: string; line: number }[]> {
    const tasks: { file: string; content: string; line: number }[] = [];

    for (const folder of folders) {
      const files = await this.app.vault.adapter.list(folder);
      for (const file of files.files) {
        const content = await this.app.vault.adapter.read(file);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.match(/- \[ \].*📅 \d{4}-\d{2}-\d{2}/)) {
            tasks.push({ file, content: line, line: index });
          }
        });
      }
    }

    return tasks;
  }

  createTaskElement(task: { file: string; content: string; line: number }) {
    const { contentEl } = this;

    const taskEl = contentEl.createEl('div', { cls: 'task-item' });
  
    const dateMatch = task.content.match(/📅 (\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const taskDate = new Date(dateMatch[1]);
      const currentDate = new Date();

      if (taskDate < currentDate) {
        taskEl.createEl('span', { text: task.content });
        taskEl.createEl('span', { text: ' (Overdue)', cls: 'overdue' });

        const dateInput = taskEl.createEl('input', { type: 'date' });
        dateInput.value = dateMatch[1];

        const updateButton = taskEl.createEl('button', { text: 'Update Date' });
        updateButton.addEventListener('click', async () => {
          const newDate = dateInput.value;

          await this.deleteTask(task.file, task.line);
          
          const updatedContent = task.content.replace(/📅 \d{4}-\d{2}-\d{2}/, `📅 ${newDate}`);
          await this.updateTask(task.file, task.line, updatedContent);
          new Notice('Task date updated.');

          taskEl.empty();
        });

        const deleteButton = taskEl.createEl('button', { text: 'Delete Task' });
        deleteButton.style.backgroundColor = '#DA1010';
        deleteButton.addEventListener('click', async () => {
          await this.deleteTask(task.file, task.line);
          new Notice('Task deleted.');

          taskEl.empty();
        });
      }
    }
  }

  async updateTask(file: string, line: number, newContent: string) {
    const content = await this.app.vault.adapter.read(file);
    const lines = content.split('\n');
    lines[line] = newContent;
    await this.app.vault.adapter.write(file, lines.join('\n'));
  }

  async deleteTask(file: string, line: number) {
    const content = await this.app.vault.adapter.read(file);
    const lines = content.split('\n');
    lines.splice(line, 1);
    await this.app.vault.adapter.write(file, lines.join('\n'));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}