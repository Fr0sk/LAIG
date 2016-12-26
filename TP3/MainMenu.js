MainMenu = function(scene) {
    this.scene = scene;
    this.onMainMenu = true;

    var mainMenuScene = "MainMenu.dsx";
    new MySceneGraph(mainMenuScene, this.scene);
}

MainMenu.prototype = Object.create(CGFobject.prototype);
MainMenu.prototype.constructor = MainMenu;

MainMenu.prototype.close = function() {
    this.onMainMenu = false;
}

MainMenu.prototype.picking = function (obj, id) {
    switch (id) {
        case 1: // Easy
        case 2: // Medium
        case 3: // Hard
            this.difficulty = id;
            break;
        case 4: // Human vs Human
        case 5: // Human vs AI
        case 6: // AI vs AI
            this.mode = id;
            break;
        case 7:
            this.startGame();
            break;
    }
}

MainMenu.prototype.display = function() {
    
}

MainMenu.prototype.startGame = function() {
    if (this.difficulty && this.mode) {
        this.close();
        this.scene.game = new Game(this.scene, this.mode-4, this.difficulty-1);
        this.scene.game.startGame(this.difficulty, this.mode);
    }
}

