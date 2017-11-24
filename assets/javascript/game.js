function Character(chr_name, img, hp, attack, counter_attack) {
	this.name = chr_name;
	this.image = img;
	this.health = hp;
	this.current_attack = attack;
	this.counter_attack = counter_attack;
	this.attack_boost = attack;
	this.alive = true;
};

Character.prototype = {

	isAlive : function(){
		return this.alive;
	},
	actAttack : function(defender){
		defender.health -= this.current_attack;
		if( defender.health <= 0 ) defender.alive = false;
		this.current_attack += this.attack_boost;
	},
	actCounterAttack : function(character){
		character.health -= this.counter_attack;
		if( character.health <=0 ) character.alive = false;
	},

	draw : function(id, ava_class, divId){
		var character = $("<div>");
		character.attr("data", id);
		character.attr("class","char_container "+ava_class);

		var char_name = $("<div>");
		char_name.attr("class", "character_name");
		char_name.text(this.name);
		character.append(char_name);

		var avatar = $("<img>");
		avatar.attr("src", "assets/images/"+this.image);
		avatar.attr("class", "img-fluid float-left avatar");
		avatar.attr("alt", "image of "+this.name);
		character.append(avatar);

		var char_hp = $("<div>");
		char_hp.attr("class", "character_hp");
		char_hp.text(this.health);
		character.append(char_hp);

		$("#"+divId).append(character);
	}
};

var game = {

	charList : [],
	defenderList : [],

	charMain : null,
	charDef : null,
	
	gameStatus : -1, // 0: lost battle; 1: won battle

	battleText1 : "",
	battleText2 : "",

	state : 1,  //1: initial state, choose main; 2: choose enemy, 3: battle.

	start : function(){
		
		this.charList = [ 	
							new Character("Yoda", "yoda.png", 130, 15, 20),
							new Character("Darth Maul", "maul.png", 145, 10, 25),
							new Character("Luke Skywolker", "luke.png", 100, 18, 30),
							new Character("Darth Vader", "vader.png", 170, 8, 15) 
						];

		this.defenderList = [];
		this.charMain = null;
		this.charDef  = null;
		this.gameStatus = -1;
		this.state = 1;
		
		this.battleText1 = "";
		this.battleText2 = "";

		this.draw();
	},

	chooseMain : function(n_char){
		this.charMain = this.charList[n_char];
		var j = 0;
		for(var i=0; i< (this.charList).length; i++){
			if( i != n_char ){
				this.defenderList[j] = this.charList[i];
				j++;
			}
		}
		this.state = 2;
		this.draw();
	},

	chooseDefender: function(n_char){
		this.charDef = this.defenderList[n_char];
		this.defenderList.splice(n_char,1);
		this.state = 3;
		this.gameStatus = -1;
		
		this.battleText1 = "";
		this.battleText2 = "";
		
		this.draw();
	},

	attack : function() { //attack button

		if(this.charMain && this.charDef){

			var def_name = this.charDef.name;
			var def_attack = this.charDef.counter_attack;
			var main_attack = this.charMain.current_attack;

			this.charMain.actAttack(this.charDef);
			if( this.charDef.isAlive() ){
				this.charDef.actCounterAttack(this.charMain);
				if( !this.charMain.isAlive() ){
					this.gameStatus = 0;//lost
					this.state = 2;
				}
			}
			else{ // defender died
				this.charDef = null;
				this.gameStatus = 1;//won
				this.state = 2;
			}
			this.battleLog(def_name, def_attack, main_attack);
		}
		this.draw();
	},

	battleLog: function(def_name, def_attack, attack){

		this.battleText1 = "";
		this.battleText2 = "";

		if( this.gameStatus == 0 ){
			this.battleText1 = "You lost! Game Over!";
		}
		else if( this.gameStatus == 1 ){
			if( this.defenderList.length > 0 ){
				this.battleText1 = "You have defeated " + def_name;
				this.battleText2 = "You can choose to fight another enemy.";
			}
			else {
				this.battleText1 = "You Won!!! Game Over!!!";
			}
		}
		else if ( this.gameStatus == -1 ){
			if(this.state == 3){
				this.battleText1 = "You attacked " + def_name + " for " + attack + " damage.";
				this.battleText2 = def_name + " attacked you back for " + def_attack + " damage.";
			}
		}
	},

	draw : function(){

		// console.log("DRAW, state = "+this.state);

		$("#divMainChar").empty();
		$("#divDefChar").empty();
		$("#divCharList").empty();

		$("#btn_attack").hide();
		$("#btn_restart").hide();

		$("#divBattleLog").empty();
		$("#divInstructions").empty();

		if( this.state == 1 ){
			//draw available characters
			$.each(this.charList, function( index, character ){
				character.draw(index, "friend", "divCharList");
			});
			
			$("#divInstructions").text("Choose Your Hero");
		}
		else if( this.state > 1 && this.state < 4 ){

			//draw defenderList
			$.each(this.defenderList, function( index, character ){
				character.draw(index, "enemy", "divCharList");
			});
			$("#btn_restart").show();

			if( this.state == 2 && this.defenderList.length > 0){
				$("#divInstructions").text("Choose Defender");
			}

			//draw main
			this.charMain.draw(-1, "friend", "divMainChar");

			// 'lost' situation
			if( this.gameStatus == 0 ){
				//draw current defender
				this.charDef.draw(-1, "enemy", "divDefChar");

				$("#divBattleLog").append( $("<p>").text(this.battleText1) );
				$("#divBattleLog p").attr("class", "lost");
				$("#divInstructions").empty();
				$("#btn_attack").hide();
			}
			// 'won' situation
			if( this.gameStatus == 1 ){
				$("#divBattleLog").append( $("<p>").text(this.battleText1) );
				$("#divBattleLog").append( $("<p>").text(this.battleText2) );
				$("#divBattleLog p").attr("class", "won");
				$("#btn_attack").hide();
			}

			if( this.state == 3 ){
				// draw current defender
				this.charDef.draw(-1, "enemy", "divDefChar");

				$("#divInstructions").text("Click The Swords To Attack");

				//still fighting
				if(this.gameStatus == -1){
					$("#btn_attack").show();
					$("#divBattleLog").append( $("<p>").text(this.battleText1) );
					$("#divBattleLog").append( $("<p>").text(this.battleText2) );
				}
			}

		}

	}
};


$(document).ready(function() {

	game.start();

	$("#divCharList").on("click", "div.char_container", function(){
		var index = $(this).attr("data");
		if( game.state == 1 ){ 
			game.chooseMain(index);
		}
		else if( game.state == 2 ){
			if( game.defenderList.length > 0){
				game.chooseDefender(index);
			}
		} 
	});

	$("#btn_attack").on("click", function(){
		game.attack();

	});

	$("#btn_restart").on("click", function(){
		game.start();

	});

});



