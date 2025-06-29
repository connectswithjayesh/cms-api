import fs from 'fs';
import path from 'path';

interface FileData {
    base64File: string;
    name: string;
    ext: string;
    size: number;
    type: string;
}

export default class FileUploadService {

    constructor(){

    }

    // Ensure the folder exists
    private createFolderIfNotExists(folderName: string): void {
        const uploadFolderPath = path.join(global.UPLOADPATH, folderName);
        if (!fs.existsSync(uploadFolderPath)) {
            fs.mkdirSync(uploadFolderPath, { recursive: true });
        }
    }

    // Function to handle single or multiple file uploads with dynamic folder
    public async upload(fileData: FileData | FileData[], folderName: string): Promise<string | string[]> {
        // Ensure the folder exists
        this.createFolderIfNotExists(folderName);

        if (Array.isArray(fileData)) {
            // Handle multiple files
            return await this.uploadMultipleFiles(fileData, folderName);
        } else {
            // Handle single file
            return await this.uploadSingleFile(fileData, folderName);
        }
    }

    /**
     * @desc generate unique file name
     * @param originalName 
     * @returns 
     */
    private generateUniqueFilename(originalName: string): string {
        const ext = path.extname(originalName); // Get the file extension
        const timestamp = Date.now(); // Get the current timestamp
        const randomNum = Math.floor(Math.random() * 1000); // Generate a random number
        return `${timestamp}-${randomNum}${ext}`; // Return unique filename
    }

    // Upload single base64 file
    private async uploadSingleFile(fileData: FileData, folderName: string): Promise<string> {
        try {
            if(fileData?.type == "new"){
                const base64Data = fileData.base64File.split(';base64,').pop();
                const uniqueFilename = this.generateUniqueFilename(fileData.name); // Generate a unique filename
                const filePath = path.join(global.UPLOADPATH, folderName, uniqueFilename);
                // Write the file
                await fs.promises.writeFile(filePath, base64Data!, { encoding: 'base64' });
                return uniqueFilename;
            }else{
                return fileData.name;
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    // Upload multiple files
    private async uploadMultipleFiles(filesData: FileData[], folderName: string): Promise<string[]> {
        try {
            const uploadPromises = filesData.map((fileData) => this.uploadSingleFile(fileData, folderName));
            const filePaths = await Promise.all(uploadPromises);
            return filePaths;
        } catch (error) {
            console.error('Error uploading multiple files:', error);
            throw error;
        }
    }
}
