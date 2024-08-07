import { App, Modal, TextComponent, ButtonComponent, TFile, Notice } from "obsidian";

export class AddTaskToInboxModal extends Modal {
  text: string;

  constructor(app: App) {
    super(app);
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

      addTaskToIbox(this.text, TFile).then(()=>{new Notice('Task added to inbox')});


      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

async function addTaskToIbox(text: string, TFile: any) {
  const filePath = 'GTD/Inbox.md';
  const file = this.app.vault.getAbstractFileByPath(filePath);

  if (file instanceof TFile && text.trim() !== '') {
      try {
          text = `- [ ] ${text}`;
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

          return true;
          
      }
      catch (e) {
          console.log(`Error ${e}`)
          return false;
      }

  }
}