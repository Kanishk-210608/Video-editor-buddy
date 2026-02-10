const { FFmpeg } = window.FFmpeg;
const { fetchFile } = window.FFmpegUtil;
let ffmpeg = null;

async function process(action) {
    const fileInput = document.getElementById('video-upload');
    const file = fileInput.files[0];
    if (!file) return alert("Please upload a video first!");

    const msg = document.getElementById('message');
    const progress = document.getElementById('progress-fill');
    
    if (ffmpeg === null) {
        ffmpeg = new FFmpeg();
        ffmpeg.on('progress', ({ progress: p }) => {
            progress.style.width = `${p * 100}%`;
        });
        await ffmpeg.load({
            coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
        });
    }

    msg.innerText = "Processing... please wait.";
    await ffmpeg.writeFile('input_file', await fetchFile(file));

    let cmd = [];
    let outName = 'output.mp4';

    if (action === 'trim') cmd = ['-i', 'input_file', '-t', '5', '-c', 'copy', outName];
    if (action === 'mute') cmd = ['-i', 'input_file', '-an', '-vcodec', 'copy', outName];
    if (action === 'gray') cmd = ['-i', 'input_file', '-vf', 'format=gray', outName];
    if (action === 'gif') { outName = 'output.gif'; cmd = ['-i', 'input_file', '-t', '3', '-vf', 'fps=10,scale=320:-1', outName]; }

    await ffmpeg.exec(cmd);
    const data = await ffmpeg.readFile(outName);
    const url = URL.createObjectURL(new Blob([data.buffer], { type: action === 'gif' ? 'image/gif' : 'video/mp4' }));

    const dl = document.getElementById('download-link');
    dl.href = url;
    dl.download = outName;
    dl.style.display = 'block';
    msg.innerText = "Done! Download below.";
}

document.getElementById('video-upload').onchange = (e) => {
    document.getElementById('preview-player').src = URL.createObjectURL(e.target.files[0]);
};
