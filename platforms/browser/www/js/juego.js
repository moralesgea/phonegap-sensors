// JavaScript Document
var app =
{
	InitApp: function()
	{
		DIAMETRO_BOLA= 50;
		widthDispositivo= document.documentElement.clientWidth;
		heightDispositivo= document.documentElement.clientHeight;
		
		velocidadX= 0;
		velocidadY= 0;
		
		miScore= 0;
		miScoreText= null;
		miBola= null;
		miObjetivo= null;  
		miObjetivo10= null;
		
		hayColisionBordes= false;
		fondoInicial= 0xff*0x010000 + 0x28*0x000100 + 0xff*0x000001; //Equivalente a un RGB en hexadecimal
		fondoColisionBordes= '#ff0000'; //Rojo puro para representar colisión con los bordes
		fondoActual= fondoInicial;
		
		miLevel= 0;
		miLevelText= null;
		
		miFactorTiempoInicial= 100;
		miFactorTiempo= miFactorTiempoInicial;
		
		this.InitFastClick();
		this.AcelerometroReady();
		this.InitJuego();
	},

	InitFastClick: function()
	{
		FastClick.attach(document.body);	
		console.log ('Agitado');		
	},
	
	AcelerometroReady: function() 
	{ 
		navigator.accelerometer.watchAcceleration (app.UpdateAceleracion, app.ErrorAcelerometro, { frequency: 10});
	},
	
	UpdateAceleracion: function (aceleracion)
	{
		app.DetectarAgitacion(aceleracion);
		app.UpdateVelocidad(aceleracion);
	},
	
	DetectarAgitacion: function (aceleracion)
	{
		if ((aceleracion.x > 10) || (aceleracion.y > 10))
		{
			document.body.className= 'EnAgitacion';
			console.log ('Agitado');
			
			setTimeout (app.Reinit, 1000);
		}
		else
			document.body.className= '';
	},
	
	Reinit: function()
	{
		document.location.reload(true);
	},
	
	UpdateVelocidad: function (aceleracion)
	{
		velocidadX= aceleracion.x*(-1)*miFactorTiempo;
		velocidadY= aceleracion.y*miFactorTiempo;
	},
	
	InitJuego: function ()
	{
		var estadosJuego= {preload: Preload, create: Create, update: Update};
		var juego= new Phaser.Game (widthDispositivo, heightDispositivo, Phaser.CANVAS, 'idPhaser', estadosJuego);
			
		function Preload()
		{						
			juego.stage.backgroundColor= fondoActual= fondoInicial;
			juego.load.image ('imagenBola', 'assets/bola.png');	
			juego.load.image ('imagenObjetivo', 'assets/objetivo.png');	
			juego.load.image ('imagenObjetivo10', 'assets/objetivo10.png');	
			
			juego.physics.startSystem (Phaser.Physics.ARCADE);						
		}
		
		function Create()
		{
			miScoreText= juego.add.text (16, 16, miScore, {fontSize: '50px', fill: '#757676'});
			miLevelText= juego.add.text (16, heightDispositivo - 50, miLevel, {fontSize: '50px', fill: '#757676'});
			
			miScoreText.text= 'Score: ' + miScore; 
			miLevelText.text= 'Level: ' + miLevel; 
	
			miObjetivo= juego.add.sprite (app.InitX(), app.InitY(), 'imagenObjetivo'); 
			miObjetivo10= juego.add.sprite (app.InitX(), app.InitY(), 'imagenObjetivo10'); 
			
			miBola= juego.add.sprite (app.InitX(), app.InitY(), 'imagenBola'); //En la posición indicada se coloca la esquina sup-izda del sprite
			
			juego.physics.arcade.enable(miBola);	
			juego.physics.arcade.enable(miObjetivo);
			juego.physics.arcade.enable(miObjetivo10);
			
			miBola.body.collideWorldBounds= true;
			miBola.body.onWorldBounds= new Phaser.Signal();
			miBola.body.onWorldBounds.add(app.DecrementarScore, this);
		}	
		
		function Update()
		{
			if (miScore <= 0)
			{
				miLevel= 0;
				miLevelText.text= 'Level: ' + miLevel;
				juego.stage.backgroundColor= fondoActual= fondoInicial;
			}
			else
			{
				//Aumento el nivel de dificultad cada 1000 puntos
				miLevel= Math.floor(miScore/1000);
				
				//Incremento la velocidad de la bola en función del nivel de dificultad
				miFactorTiempo= miFactorTiempoInicial + 90*miLevel;
				
				//Actualizo el fondo aclarándolo conforme aumenta el nivel de dificultad
				fondoActual= fondoInicial + (0x0d*miLevel)*0x000100; //Modifico la componente G del inicial 0x28 hacia 0xFF (hacia blanco, pues R y B ya son 0xFF)
				juego.stage.backgroundColor= fondoActual;
			}
			
			
			if (hayColisionBordes==true)
			{
				juego.stage.backgroundColor= fondoColisionBordes;
				hayColisionBordes= false;
			}
			else
				juego.stage.backgroundColor= fondoActual;
			
			miBola.body.velocity.x= velocidadX;
			miBola.body.velocity.y= velocidadY;
			
			juego.physics.arcade.overlap (miBola, miObjetivo, app.IncrementarScore, null, this);
			juego.physics.arcade.overlap (miBola, miObjetivo10, app.IncrementarScore10, null, this);
		}
	},
	
	
	CheckGameOver: function()
	{
		if (miScore >= 10000)
		{
			miScoreText.text= 'GAME OVER'; 
			miLevelText.text= ''; 
				
			for (var i= 0; i<35000; i++){ var a; a++;}
			
			app.Reinit();
		}	
	},
	
	IncrementarScore: function()
	{
		miScore++;
		miScoreText.text= 'Score: ' + miScore; 
		miLevelText.text= 'Level: ' + miLevel; 
		
		app.CheckGameOver();
	},
	
	IncrementarScore10: function()
	{
		miScore+= 10;
		miScoreText.text= 'Score: ' + miScore; 
		miLevelText.text= 'Level: ' + miLevel; 
		
		app.CheckGameOver();
	},
	
	DecrementarScore: function()
	{
		hayColisionBordes= true;
		
		miScore--;
		miScoreText.text= 'Score: ' + miScore;
		miLevelText.text= 'Level: ' + miLevel; 
	},
	
	InitX: function()
	{
		return app.GetAleatorioHasta (widthDispositivo - DIAMETRO_BOLA);
	},
	
	InitY: function()
	{
		return app.GetAleatorioHasta(heightDispositivo - DIAMETRO_BOLA);
	},
	
	GetAleatorioHasta: function(maximo)
	{
		return Math.floor(Math.random()*maximo);
	},
	
	ErrorAcelerometro: function ()
	{
		console.log (' Error en acelerometro');
	}
};


if('addEventListener' in document) 
{
	document.addEventListener('deviceready', function(){ app.InitApp();}, false);
}


