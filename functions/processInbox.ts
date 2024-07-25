export async function processInbox() {
        let tasks: string[];
        const filePath = 'GTD/Inbox.md';

        try {
          const fileContent = await this.app.vault.adapter.read(filePath);
          const tasks = fileContent.split('\n').filter((line: string) => line.startsWith('- [ ]'));
          
          return tasks;
          //new ProcessInboxModal(this.app, tasks).open();
        } catch (error) {
          console.error('Failed to read file:', error);
        }
      }