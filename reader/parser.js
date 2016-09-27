parse = function() {
    var input = "<testebiggerTag>Hello com espaços<and>mais abrir e fechar tags</and></testebiggerTag>";
    input = "<teste Double Hello com espaços <and>mais abrir e fechar tags</and> ?>"
    console.log("INPUT DATA:" + input);

    // Clears the content for any characters outsite the tags
    var content = input.substr(input.indexOf("<"));
    content = content.substr(0, content.lastIndexOf(">") + 1);

    while(content.length > 0) {
        console.log("____________________________________________________________");
        console.log("INPUT:" + content);

        if (content.indexOf("<!--") == 0) {
            content = content.substr(content.indexOf("-->") + 3);
            input.substr(input.indexOf("<"));
            content = content.substr(0, content.lastIndexOf(">") + 1);
        }
        
        var tagName;
        if (content.charAt(content.length - 2) == "?") {
            tagName = content.substr(1, content.indexOf(" ") - 1);                                      // Gets the tag name
            content = content.substr(tagName.length + 2, content.length - (tagName.length + 2 + 3));    // Removes opening and closing tags
        } else {
            tagName = content.substr(1, content.indexOf(">") - 1);                                      // Gets the tag name
            content = content.substr(tagName.length + 2, content.length - (2*tagName.length + 2 + 3));  // Removes opening and closing tag
        }
        var params = content.indexOf("<") > 0 ? content.substr(0, content.indexOf("<")) : content;      // Gets the params of the current tag 
        content = content.indexOf("<") != -1 ? content.substr(content.indexOf("<")) : "";               // Formats content for next interation
        input.substr(input.indexOf("<"));
        content = content.substr(0, content.lastIndexOf(">") + 1);
        
        console.log("TAGNAME:" + tagName);
        console.log("PARAMS:" + params);
        console.log("CONTENT:" + content);
        console.log("____________________________________________________________");

    }
}