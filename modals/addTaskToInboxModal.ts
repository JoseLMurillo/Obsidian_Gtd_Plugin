import { App, Modal, TextComponent, ButtonComponent } from "obsidian";

export class AddTaskToInboxModal extends Modal {
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