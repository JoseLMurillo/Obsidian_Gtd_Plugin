import { App, Modal, Setting, TextComponent, ButtonComponent, Notice } from "obsidian";

export class processTask extends Modal {
  name: String;
  listItem: string;
  time: string;
  date: string;
  hour: string;
  id: string;

  tarea: string;

  constructor(app: App, tarea: string) {
    super(app);
    this.tarea = tarea;
  }

  onOpen() {
    new Notice(this.tarea);
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Process tasks' });

    new Setting(contentEl)
      .setName('Nombre')
      .addText(text => text.onChange(value => {
        this.name = value;
      }));

    
    // List field
    new Setting(contentEl)
      .setName('Lista')
      .addDropdown(dropdown => {
        dropdown.addOption('option1', 'Option 1');
        dropdown.addOption('option2', 'Option 2');
        dropdown.addOption('option3', 'Option 3');
        dropdown.addOption('option4', 'Option 4');
        dropdown.onChange(value => {
          this.listItem = value;
        });
      });

    // Time field
    new Setting(contentEl)
      .setName('Tiempo')
      .addText((text) => {
        text.inputEl.setAttribute('type', 'time');
        text.onChange((value) => {
          this.time = value;
        })
      });

    // Date field
    new Setting(contentEl)
      .setName('Fecha')
      .addText((text) => {
        text.inputEl.setAttribute('type', 'date');
        text.onChange((value) => {
          this.time = value;
        })
      });
    
    // Hour field
    new Setting(contentEl)
      .setName('Hora')
      .addText((text) => {
        text.inputEl.setAttribute('type', 'time');
        text.onChange((value) => {
          this.hour = value;
        })
      });

    // ID field (optional)
    new Setting(contentEl)
      .setName('ID (Opcional)')
      .addText(text => text.onChange(value => {
        this.id = value;
      }));

    // Add a submit button
    contentEl.createEl('button', { text: 'Submit' }).addEventListener('click', () => {
      this.submit();
    });

  }

  submit() {
    console.log('Nombre:', this.name);
    console.log('Lista:', this.listItem);
    console.log('Tiempo:', this.time);
    console.log('Fecha:', this.date);
    console.log('Hora:', this.hour);
    console.log('ID (Opcional):', this.id);
    this.close();
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