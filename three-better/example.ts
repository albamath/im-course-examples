const inputElt = $e("input");
inputElt.valueAsNumber;

const tableElt = $e("table");

function getString()
 {
    return "table";
};

function $e<K extends keyof HTMLElementTagNameMap>(
    tagname: K,
): HTMLElementTagNameMap[K] {
    return document.createElement(tagname)
}