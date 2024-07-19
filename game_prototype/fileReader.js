async function readLocalFiles(maxFiles = 2) {
    const directories = ['nonfiction-works', 'fiction-works'];
    let dataset = '';

    for (const dir of directories) {
        try {
            const response = await fetch(`/list-files/${dir}`);
            const files = await response.json();

            for (let i = 0; i < Math.min(maxFiles, files.length); i++) {
                const fileName = files[i];
                const fileContent = await fetch(`/read-file/${dir}/${fileName}`).then(res => res.text());
                dataset += fileContent;
            }
        } catch (error) {
            console.error(`Error reading files from ${dir}:`, error);
            updateTrainingInfo(`Error reading files from ${dir}. Please check the console for details.`);
        }
    }

    return dataset;
}