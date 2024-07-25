import { Modal, App, Notice, Setting, TAbstractFile } from "obsidian";

export class ProcessFileModal extends Modal {
    selectedFile: string;
    selectedDestination: string = 'default';

    constructor(app: App) {
        super(app);
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const h2 = contentEl.createEl('h2', { text: 'Move or Delete Proyect' });

        const taskDivParent = contentEl.createDiv();
        taskDivParent.style.backgroundColor = '#006C8C';

        const taskDiv = contentEl.createDiv();

        new Setting(taskDivParent)
            .setName('Select folder to process')
            .addDropdown(dropdown => {
                dropdown.addOption('default', '');
                dropdown.addOption('2. Stay', 'Stay');
                dropdown.addOption('3. Someday', 'Someday');

                dropdown.onChange(async value => {
                    taskDiv.empty();

                    const folderPath = `GTD/${value}`;

                    try {
                        const files = await this.app.vault.adapter.list(folderPath);
                        const fileList = files.files;

                        if (fileList.length === 0) {
                            contentEl.createEl('p', { text: 'No files found in the Someday folder.' });
                            return;
                        }

                        for (let task of fileList) {

                            taskDiv.createEl('h3', { text: this.getLastPart(task) });

                            new Setting(taskDiv)
                                .setName('Select the destination')
                                .addDropdown(dropdown => {
                                    dropdown.addOption('default', '');
                                    dropdown.addOption('1. Projects', 'Projects');
                                    dropdown.addOption('2. Stay', 'Stay');
                                    dropdown.addOption('4. Archive', 'Archive');

                                    dropdown.onChange(async value => {
                                        this.selectedDestination = value;
                                    })
                                });

                            taskDiv.createEl('button', { text: 'Move' }).addEventListener('click', async () => {
                                if (task && this.selectedDestination !== 'default') {
                                    await this.moveFile(task, this.selectedDestination);

                                    taskDiv.empty();
                                } else {
                                    new Notice('Please select a file and folder first.');
                                }
                            });

                            const btnDelete = taskDiv.createEl('button', { text: 'Delete' });

                            btnDelete.style.backgroundColor = '#DA1010';

                            btnDelete.addEventListener('click', async () => {
                                if (task) {
                                    await this.deleteFile(task);
                                    new Notice(`Deleted ${task}`);
                                    taskDiv.empty();

                                } else {
                                    new Notice('Please select a file first.');
                                }
                            });
                        }
                    }

                    catch (error) {
                        console.log(error);
                    }


                });
            });







    }


    async moveFile(file: string, destination: string) {
        const sourcePath = file;
        const destinationPath = `GTD/${destination}/${this.getLastPart(file)}`;
        const fileContent = await this.app.vault.adapter.read(sourcePath);

        await this.app.vault.create(`${destinationPath}/`, `${fileContent}`);

        await this.deleteFile(file);
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

    async deleteFile(file: string) {
        const filePath = file;

        try {
            await this.app.vault.adapter.remove(filePath);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}