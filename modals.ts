import { App, Modal, Setting, TextComponent, ButtonComponent, Notice, TFile } from "obsidian";

export class processInboxModal extends Modal {
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

      //selector de carpeta/archivo
      new Setting(taskDiv)
        .setName('Selecciona destino')
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

          dropdown.onChange(async value => {
            this.selectedFolder = value;

            fileDropdown.setName('').clear();
            fileName.setName('').clear();
            tag.setName('').clear();
            time.setName('').clear();
            date.setName('').clear();
            hour.setName('').clear();

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
            tag.setName('Tag')
              .addText(text => {
                text.onChange(value => {
                  this.taskTag = value;
                });
              })
              .settingEl.setAttribute('required', 'true')
              ;

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
        })
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

      }
      catch (e) {
        new Notice('ERROR');

        console.log(`Error ${e}`)
      }
    }
  }


  async deleteTaskFromFile(filePath: string, taskToDelete: string) {
    try {
      const fileContent = await this.app.vault.adapter.read(filePath);
      const lines = fileContent.split('\n');
      const updatedLines = lines.filter(line => line.trim() !== taskToDelete.trim());
      const updatedContent = updatedLines.join('\n');

      await this.app.vault.adapter.write(filePath, updatedContent);
      new Notice (`Task deleted: ${taskToDelete}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
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

      this.deleteTaskFromFile('GTD/Inbox.md', task);
    }
    catch(error) {
      console.error('Error handling task:', error);
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export class AddTaskModal extends Modal {
  text: string;
  onSubmit: (text: string) => void;

  constructor(app: App, onSubmit: (text: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Add task' });

    const textComponent = new TextComponent(contentEl);
    textComponent.onChange(value => {
      this.text = value;
    });

    const submitButton = new ButtonComponent(contentEl);
    submitButton.setButtonText('Add').onClick(() => {
      this.close();
      this.onSubmit(this.text);
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export class ExampleModal extends Modal {
  result: string;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: "What's your name?" });

    new Setting(contentEl)
      .setName("Name")
      .addText((text) =>
        text.onChange((value) => {
          this.result = value
        }));

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Submit")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.result);
          }));
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}