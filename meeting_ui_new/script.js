function toggle(element) {
    const on = document.getElementById(element + '-on');
    const off = document.getElementById(element + '-off');

    on.classList.toggle('button--hidden');
    off.classList.toggle('button--hidden');
}
