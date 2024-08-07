import { App, Modal, Setting, Notice, TFile } from "obsidian";

export class ProcessInboxModal extends Modal {
  tasks: string[];
  selectedFolder: string = 'default';
  selectedFile: string = 'default';
  newFileName: string;
  taskTag: string;
  taskTime: string;
  taskDate: string;
  taskHour: string;

  task: string;

  constructor(app: App, tasks: string[]) {
    super(app);
    this.tasks = tasks;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Tasks' });

    for (let task of this.tasks) {
      const taskDiv = contentEl.createDiv();
      taskDiv.createEl('p', { text: task });

      // Selector de carpeta/archivo
      new Setting(taskDiv)
        .setName('Select the destination')
        .addDropdown(dropdown => {
          dropdown.addOption('default', '');
          dropdown.addOption('1. Projects', 'Projects');
          dropdown.addOption('2. Stay', 'Stay');
          dropdown.addOption('3. Someday', 'Someday');
          dropdown.addOption('Follow', 'Follow');

          let fileDropdown = new Setting(taskDiv);
          let fileName = new Setting(taskDiv);
          let tag = new Setting(taskDiv);
          let time = new Setting(taskDiv);
          let date = new Setting(taskDiv);
          let hour = new Setting(taskDiv);
          let tag2 = new Setting(taskDiv);

          dropdown.onChange(async value => {
            this.selectedFolder = value;

            fileDropdown.setName('').clear();
            fileName.setName('').clear();
            tag.setName('').clear();
            time.setName('').clear();
            date.setName('').clear();
            hour.setName('').clear();
            tag2.setName('').clear();

            if (value !== 'Follow' && value !== 'default') {
              const files = await this.app.vault.adapter.list(`GTD/${value}`);

              if (files.files) {
                fileDropdown.setName('Select a project or create a new one')
                  .addDropdown(fileDropdown => {
                    fileDropdown.addOption('default', '');

                    files.files.forEach(file => {
                      fileDropdown.addOption(file, this.getLastPart(file));
                    });

                    fileDropdown.onChange(fileValue => {
                      this.selectedFile = fileValue;
                    });
                  });
              }
            }

            fileName
              .setName('Project name if you do not have one selected')
              .addText(text => {
                text.onChange(value => {
                  this.newFileName = value;
                });
              });

            // TAG
            tag.setName('Select the tag')
              .addDropdown(dropdown => {
                dropdown.addOption('default', '');
                dropdown.addOption('UI', 'UI');
                dropdown.addOption('INU', 'INU');
                dropdown.addOption('UNI', 'UNI');
                dropdown.addOption('NUNI', 'NUNI');

                dropdown.onChange(value => {
                  this.taskTag = value;
                });
              });

            // DURATION TIME
            time.setName('Duration time')
              .addText(text => {
                text.onChange(value => {
                  this.taskTime = value;
                });
              });

            // DATE
            date.setName('Date')
              .addText(text => {
                text.inputEl.setAttribute('type', 'date');
                text.onChange(value => {
                  this.taskDate = value;
                });
              });

            // HOUR
            hour.setName('Hour')
              .addText(text => {
                text.inputEl.setAttribute('type', 'time');
                text.onChange(value => {
                  this.taskHour = value;
                });
              });
          });

          // BTN PROCESS
          taskDiv.createEl('button', { text: 'Process' }).addEventListener('click', () => {
            this.processTask(task);
            taskDiv.empty();
          });

          const deleteButton = taskDiv.createEl('button', { text: 'Delete Task' });
          deleteButton.style.backgroundColor = '#DA1010';
          deleteButton.addEventListener('click', async () => {
            await this.deleteTaskFromFile('GTD/Inbox.md', task);
            taskDiv.empty();
            new Notice('Task deleted.');
          });
        });
    }
  }

  async deleteTaskFromFile(filePath: string, taskToDelete: string) {
    try {
      const fileContent = await this.app.vault.adapter.read(filePath);
      const lines = fileContent.split('\n');
      const updatedLines = lines.filter(line => line.trim() !== taskToDelete.trim());
      const updatedContent = updatedLines.join('\n');

      await this.app.vault.adapter.write(filePath, updatedContent);
      new Notice(`Task deleted: ${taskToDelete}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  getLastPart(text: string) {
    try {
      const lastSlashIndex = text.lastIndexOf('/');
      if (lastSlashIndex === -1) {
        return text;
      }
      return text.substring(lastSlashIndex + 1);
    } catch (error) {
      throw error;
    }
  }

  async addTaskToFile(text: string, filePath: string) {
    const file = this.app.vault.getAbstractFileByPath(filePath);

    if (file instanceof TFile && text.trim() !== '') {
      try {
        let content = await this.app.vault.read(file);

        const insertPosition = content.indexOf('# Done');
        if (insertPosition !== -1) {
          const before = content.substring(0, insertPosition);
          const after = content.substring(insertPosition);
          content = before + text + '\n' + after;
        } else {
          content += '\n' + text;
        }

        await this.app.vault.modify(file, content);
        new Notice('Task added');
      } catch (e) {
        new Notice('ERROR');
        console.log(`Error ${e}`);
      }
    }
  }

  async createProyect(path: string, fileName: string, data: string) {
    const newFilePath = `GTD/${path}/${fileName}.md`;
    const vault = this.app.vault;

    try {
      await vault.create(newFilePath, `${data}\n# Done`);
      new Notice('New project created successfully');
    } catch (e) {
      new Notice('Error');
      console.log(`File ${newFilePath} already exists.`);
    }

    return newFilePath;
  }

  async processTask(task: string) {
    const formattedTask = `${task} #${this.taskTag} **${this.taskTime}** 📅 ${this.taskDate} [hour::${this.taskHour}]`;

    try {
      if (this.selectedFolder === 'Follow') {
        await this.addTaskToFile(formattedTask, `GTD/${this.selectedFolder}.md`);
      } else if (this.selectedFile === 'default') {
        await this.createProyect(this.selectedFolder, this.newFileName, formattedTask);
      } else {
        await this.addTaskToFile(formattedTask, this.selectedFile);
      }

      await this.deleteTaskFromFile('GTD/Inbox.md', task);
    } catch (error) {
      console.error('Error handling task:', error);
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}