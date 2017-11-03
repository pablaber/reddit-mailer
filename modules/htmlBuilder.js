module.exports = function(name, innerHTML) {
    return {
        name: name,
        attributes: {},
        children: !!innerHTML ? innerHTML : [],
        html: function() {
            return tagString(this.name, this.attributes, this.children);
        },
        style: function(styleObj) {
            this.attributes.style = createStyle(styleObj);
            return this;
        },
        attr: function(attrObj) {
            for(var a in attrObj) {
                this.attributes[a] = attrObj[a];
            }
            return this;
        },
        addChild: function(childTag) {
            this.children.push(childTag);
            return this;
        }
    };
};

function tagString(tagName, tagAttributes, tagChildren) {
    var openTag = "<" + tagName;
    for (var attribute in tagAttributes) {
        openTag += (" " + attribute + "=\"" + tagAttributes[attribute] + "\"");
    }
    openTag += ">";
    var closeTag = "</" + tagName + ">";
    var stringContent = "";
    if (typeof (tagChildren) === "string") {
        stringContent = tagChildren;
    }
    else {
        for (var child of tagChildren) {
            stringContent += tagString(child.name, child.attributes, child.children);
        }
    }
    return openTag + stringContent + closeTag;
}

function createStyle(styleObj) {
    var styleString = "";
    for (var style in styleObj) {
        styleString += style + ":" + styleObj[style] + ";";
    }
    return styleString;
}