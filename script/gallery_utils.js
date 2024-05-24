//util functions for gallery

//downloads selected canvas from gallery, converts to pdf
export function downloadCanvas(canvas, name) {
    if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = name + '.png';
        link.click();
    } else {
        console.error('Canvas not found');
    }
}

//deletes selected canvas from localStorage
export function deleteCanvas(canvasId) {
    const userId = sessionStorage.getItem('sessionID');
    if (!userId) {
        console.error('User is not logged in');
        return;
    }

    const userCanvases = JSON.parse(localStorage.getItem(userId)) || {};
    
    if (userCanvases[canvasId]) {
        delete userCanvases[canvasId];
        localStorage.setItem(userId, JSON.stringify(userCanvases));
    } else {
        console.error(`Canvas with ID ${canvasId} not found`);
    }
    window.location.href = "?page=gallery";
}

//opens selected canvas from gallery on painting page
export function openCanvas(canvasId) {
    window.location.href = "?page=painting&id=" + canvasId;
}