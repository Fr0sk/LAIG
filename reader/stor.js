XMLScene.prototype.ProcessaGrafo = function(nodeName) {
    var material = null;

    if(nodeName != null) {
        var node = this.gaph[nodeName];
        if(node.material != null)
            material = node.material;
        if(material != null)
            this.applyMaterial(material);
        
        this.pushMatrix();
        //ou this.nulMatrix(node m);

        if(node.primitive != null)
            //desenha

        for(var i = 0; i < node.children.length; i++) {
            this.pushMatrix();
            this.applyMaterial(material);
            this.ProcessaGrafo(node.children[i]);
            this.popMatrix();
        }
    }
}

/**
 * no XMLScene:
 * this.processaGrafo(this.rootNode);
 */