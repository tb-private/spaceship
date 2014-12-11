$(document).ready(function(){

//--------  fonction hit test 
(function ($) {$.fn.hitTest = function (x, y) {
if (Math.abs(x -this.offset().left) < this.width()){
return (x > this.offset().left && x < this.offset().left + this.width()) && (y > this.offset().top && y < this.offset().top + this.height());}
else {
return false};
};})(jQuery); 



//-------- initialisation des variables
var fenetre;
var current_weapon = "basic";
var background;
var ctx;
var canvas;
var backgroundParalax;
var scrollElements = [6];
var backgroundParalaxX = 0;
var backgroundParalaxY = 0;
var nearEnemies = [];
var scrollX = 0;
var scrollY = 0; 
var motif;
var speed = 2;
var moveSpeed = speed+40;
var frameRate = 30;
var life = 5;
var timer;
var randomScrollElement;
var shipWidth = $("#spaceship").width()-5;
var shipheight = $("#spaceship").height();
var canMove = true; // smoothing movement;


init();




function init(){
	background = document.getElementById('background-scroll');
	ctx = background.getContext('2d');
	backgroundParalax = new Image();
	backgroundParalax.src = "img/fond2.png";
	scrollElements[0]=  new Image();
	scrollElements[0].src = "img/nebueuse.png";
	scrollElements[1]=  new Image();
	scrollElements[1].src = "img/nebueuse2.png";
	scrollElements[2]=  new Image();
	scrollElements[2].src = "img/nebueuse3.png";
	$("#life").html(life);
	randomScrollElement = scrollElements[Math.floor(Math.random()*scrollElements.length)];
	timerLoop = setInterval(function(){Loop()}, frameRate);
	$("#spaceship").draggable({
	    containment : '#main',
	});

	makeMenu();
}

function Loop(){
	var randomNumber = Math.floor((Math.random()*20)+1);
	scroll(scrollX);
	testHits();
	moveEnemies();
	deleteOutEnemies();
	if(randomNumber < speed){
		create_enemies();
	}
}

function testHits(){
	$(".active").each(function(){
		var currentTest = $(this);
		var offset = $(this).offset();
		$(".enemy").each(function(){
			if($(this).hitTest(offset.left,offset.top)) {
				destroyEnemies($(this), true)
				currentTest.removeClass("active");
				currentTest.remove();

			}
		});
});
}

function gameOver(){
	clearInterval(timerLoop);
	$("#life").html("Game Over !");
	$(".enemy").toggle("explode");
	setTimeout(function(){gameOverTimer()},2000);
	timerOver = setInterval(function(){scroll(scrollX)}, frameRate);
}

function gameOverTimer (){
	$("#spaceship").toggle("explode");
	$(".enemy").remove();
}

function moveShip(x, y){

	if(canMove) {
		var shipLeft = parseInt($("#spaceship").css("left"))+x;
			
		if (y != undefined){
			var shipTop = parseInt($("#spaceship").css("top"))+y;
			if (shipTop>0 && shipTop<$(document).height()-$("#spaceship").height() ){
						$("#spaceship").animate({
								top : shipTop+"px",
								left : shipLeft+"px"},
								frameRate*4);
				}
			}
		else if (shipLeft>0 && shipLeft<$(document).width()-$("#spaceship").width()){
				$("#spaceship").animate({left:shipLeft+"px"}, frameRate*4);
			}	
	}
		
}
	
function destroyEnemies(object, explode){
	if(explode){
		// var explosion = new
		$(object).removeClass("enemy");
		$(object).addClass("explode");
		$(object).attr('src', "img/explosion.gif");
		window.setTimeout(function(){ 
			object.remove()
		}, 450);
	}
	else {
		object.remove();
	}
}	

function hit() {
	life--;
	$("#life").html(life);
	if(life < 0) {
		gameOver();
	}
}
	
function testPositions(object){
	x = parseInt(object.css('left'));
	y = parseInt(object.css('top'));
	var isHit = $("#spaceship").hitTest(x,y);	
	return isHit;
}	

function moveEnemies() {
	$(".enemy").each(function(){
		if(!testPositions($(this))) {
			var position = parseInt($(this).css("left"))-(3*speed);
			$(this).css("left", position);
			}
		else {
			destroyEnemies($(this), true);
			hit();
			}	
		});
}

function deleteOutEnemies(){
	$(".enemy").each(function(){
		var position = parseInt($(this).css("left"));
		if (position < -10) { $(this).remove(); 
			}
	});
 }

function create_enemies(){
	var enemy = $('<img src="img/comete1.gif" class="enemy"></div>');
	$('#main').append(enemy);
	enemy.css("left", $(document).width()-100+"px");
	var e_height = Math.floor((Math.random()*$(document).height())+1);
	enemy.css("top", e_height+"px");
	return true;
}	
	

$(document).mousemove(function(e){
	fenetre = e;
    shipRotate(e);
});

function shipRotate(e) {
    if($("#spaceship").length){ 
        var div         = document.getElementById("spaceship");
        var pos_div     = getPosition(div);
        var center_x    = (pos_div.x) + ( shipWidth/2 );
        var center_y    = (pos_div.y) + ( shipheight/2 );
        var radians     = Math.atan2(e.clientX - center_x,  e.clientY - center_y);
        var degree      = (radians * (180 / Math.PI) * -1) +90; 
        $(div).css('-moz-transform',    'rotate('+degree+'deg)');
        $(div).css('-webkit-transform', 'rotate('+degree+'deg)');
        $(div).css('-o-transform',      'rotate('+degree+'deg)');
        $(div).css('-ms-transform',     'rotate('+degree+'deg)');
    }
}

$("html").mousedown(function(){
	switchShoot();
	var timer= setInterval(function() { switchShoot(); },300);
	$("html").mouseup(function(){
		clearInterval(timer);
		});
});

function switchShoot(){
	var destinationX = fenetre.clientX;
	var destinationY = fenetre.clientY;
	switch (current_weapon){
	case "basic":
		tirer(destinationX, destinationY, current_weapon);
		break;
	case "double":
		tirer(destinationX, destinationY, current_weapon);
		break;
	case "bombe":
		var width = $(document).width();
		var height = $(document).height();
		tirer(0, 0, current_weapon);
		tirer(width, 0, current_weapon);
		tirer(0, height, current_weapon);
		tirer(width, height, current_weapon);
		tirer(width/2, 0, current_weapon);
		tirer(0, height/2, current_weapon);
		tirer(width, height/2, current_weapon);
		tirer(width/2, height, current_weapon);
		break;
		}
}

$(document).keydown(function(e){
	var left = parseInt($("#spaceship").css("left"));
	var top = parseInt($("#spaceship").css("top"));	
	var code = e.which;

	switch(code){

		case 37: 
			moveShip(-moveSpeed);
			smoothMove();
			break;

		case 38:	
			moveShip(0, 0-moveSpeed);
			smoothMove();
			break;

		case 39:	
			moveShip(moveSpeed);
			smoothMove();
			break;

		case 40:	
			moveShip(0, moveSpeed);
			smoothMove();
			break;
			
		case 49: 
			current_weapon = "basic";
			break;	
		
		case 50: 
			current_weapon = "double";
			break;	
		
		case 51: 
			current_weapon = "bombe";
			break;	
	}


});

function smoothMove(){
	if(canMove)canMove = false;
	else{
		window.setTimeout(function(){canMove = true;}, 100);
	}
};
			
			
function tirer(x, y, weapon){
	switch(weapon){
	case "basic": 
		var proj = bullet(weapon);
		proj.animate({
			top: y+"px",
			left: x+"px"
			},Math.abs(x+fenetre.clientX),function()
				{
				$(this).fadeOut(100, function(){
					$(this).removeClass("active");
					$(this).remove();
				});
				}
			);
		break;
		
	case "bombe": 
		var proj = bullet(weapon);
		proj.animate({
			top: y+"px",
			left: x+"px"
			},1000,function()
				{
				$(this).fadeOut(100, function(){
					$(this).removeClass("active");
					$(this).remove();
				});
				}
			);
		break;	
		
	case "double": 
		var proj = bullet(weapon);	
		proj.animate({
			top: y+140+"px",
			left: x+0+"px"
			},1000,function()
				{
				$(this).fadeOut(100, function(){
					$(this).removeClass("active");
					$(this).remove();
				});
				}
			);
		
		var proj2 = bullet(weapon);
		proj2.animate({
			top: y-140+"px",
			left: x-0+"px"
			},1000,function()
				{
				$(this).fadeOut(100, function(){$(this).remove();});
				}
			);	
		break;
	}
}
			
 function getPosition(element) {
	var xPosition = 0;
	var yPosition = 0;
  
	while(element) {
		xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
		yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
		element = element.offsetParent;
	}
	return { x: xPosition, y: yPosition };
}		
 
function bullet(weapon){
		var proj = $('<div class="proj active '+weapon+'"></div>');
		var div = document.getElementById("spaceship");
		var pos_div = getPosition(div);
		var center_x = (pos_div.x) + ( $('#spaceship').width() / 2 );
		var center_y = (pos_div.y) + ( $('#spaceship').height() / 2 );

		$('#main').append(proj);	
		proj.css("left", center_x+"px");
		proj.css("top", center_y+"px");
		return proj;
 }
 
var scroll = function() {
	var decalage = -scrollX;

    var ptrn = ctx.createPattern(backgroundParalax,'repeat');
    ctx.fillStyle = ptrn;
    ctx.translate(decalage, 0);
    ctx.fillRect(-decalage, 0, background.width, background.height);
    // undo offset
    ctx.translate(-decalage, 0);

	ctx.drawImage(randomScrollElement, 1000+decalage*2, 500, randomScrollElement.width, randomScrollElement.height);   
	scrollX += speed;

	if(scrollX > 1000){
		scrollX = 0;
		var rand = Math.floor(Math.random()*scrollElements.length);
		randomScrollElement = scrollElements[rand];
	}
}

function makeMenu(){

	$(".weapon-selector").click(function(){
		current_weapon = $(this).data("weapon");
		$(".weapon-active").removeClass(".weapon-active");
		$(this).addClass(".weapon-active");
	});
}

});