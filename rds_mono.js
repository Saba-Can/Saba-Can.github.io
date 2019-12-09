var canvas=document.getElementById("rds");
var context=canvas.getContext("2d");

//event

function TouchEventFunc(e){
	var rect=canvas.getBoundingClientRect();
	var touch =e.touches[0]||e.changedTouches[0];

	gridX=Math.floor((touch.clientX-Math.floor(rect.left))/cellSize);
	gridY=Math.floor((touch.clientY-Math.floor(rect.top))/cellSize);

	if(gridX<0)return;
	if(gridY<0)return;

	for(var i=0;i<seedSize;i++){
		for(var j=0;j<seedSize;j++){
			var r=Math.random()*0.1;
			u[i-seedSize/2+gridY][j-seedSize/2+gridX]=seedU+r;
			v[i-seedSize/2+gridY][j-seedSize/2+gridX]=seedV+r;
		}
	}
	//field[gridY][gridX]=field[gridY][gridX]^1;
	drawField();
	//alert(touch.clientX);

}


document.onclick=function mousedown(e){
	
	var rect=canvas.getBoundingClientRect();

	gridX=Math.floor((e.clientX-Math.floor(rect.left))/cellSize);
	gridY=Math.floor((e.clientY-Math.floor(rect.top))/cellSize);


	if(gridX<0)return;
	if(gridY<0)return;
	//if(canvas.width/seedSize<gridX)return
	//if(canvas.height/seedSize<gridY)return;

	for(var i=0;i<seedSize;i++){
		for(var j=0;j<seedSize;j++){
			var r=Math.random()*0.1;
			u[i-seedSize/2+gridY][j-seedSize/2+gridX]=seedU+r;
			v[i-seedSize/2+gridY][j-seedSize/2+gridX]=seedV+r;
		}
	}
	//field[gridY][gridX]=field[gridY][gridX]^1;
	drawField();
	
}

document.addEventListener("touchstart",TouchEventFunc);

//Start logic
var N=256;
var cellSize=2;
var fieldRows=N+2;
var fieldCols=N+2;

var fieldU=[];
var fieldV=[];

var u=[];
var v=[];

dt=1.0;
h=0.01
h2=h*h;
Du=2e-5;
Dv=1e-5;
//amorphous
f=0.04;
k=0.06;

seedSize=20;
seedU=0.5;
seedV=0.25;

threshold=48;

var isPeriodicBaundary=false;

var tick=1;

var image=context.createImageData(N*2,N*2);

function clearField(){
	for(var row=0;row<=N+1;row++){
		for(var col=0;col<=N+1;col++){
			fieldU[row][col]=0;
			fieldV[row][col]=0;
			u[row][col]=0.0;
			v[row][col]=0.0;
		}               
	}	
}

function setInitialCondition(){
	for(var row=1;row<=N;row++){
		for(var col=1;col<=N;col++){
			u[row][col]=1.0;
			v[row][col]=0.0;
		}
	}

	for(var i=0;i<seedSize;i++){
		for(var j=0;j<seedSize;j++){
			var r=Math.random()*0.1;
			u[i+N/2-seedSize/2][j+N/2-seedSize/2]=seedU+r;
			v[i+N/2-seedSize/2][j+N/2-seedSize/2]=seedV+r;
		}
	}
}


function initField(){
	for(var row=0;row<fieldRows;row++){
			fieldU[row]=[];
			fieldV[row]=[];
			u[row]=[];
			v[row]=[];
	}          
	clearField();
	setInitialCondition();
	//setGliderGun();
}

function drawField(){
	for(var row=1;row<=N;row++){
		for(var col=1;col<=N;col++){
			fieldU[row][col]=Math.floor(u[row][col]*255);
			fieldV[row][col]=Math.floor(v[row][col]*255);
		}
	}

	for(var row=1;row<=N;row++){
		for(var col=1;col<=N;col++){
			var r=0;
			var g=fieldV[row][col];
			var b=0;
			var a=255;

			if(fieldV[row][col]<threshold){
				r=255;
				g=255;
				b=255;
			}else{
				r=0;
				g=0;
				b=0;
			}
	
			for(var i=0;i<2;i++){
				for(var j=0;j<2;j++){
					var p=((row*2+i)*N*2+col*2+j)*4;
					ary_u8[p+0]=r;
					ary_u8[p+1]=g;
					ary_u8[p+2]=b;
					ary_u8[p+3]=a;
				}
			}

		}
	}
	
	context.putImageData(image,0,0);
}

function updateField(){
	var u1=[];
	var v1=[];

	for(var row=0;row<fieldRows;row++){
		u1[row]=[];
		v1[row]=[];
	}

	for(var i=1;i<=N;i++){
		for(var j=1;j<=N;j++){
			var lp_u=(u[i+1][j]+u[i-1][j]+u[i][j-1]+u[i][j+1]-4*u[i][j])/h2;
			var lp_v=(v[i+1][j]+v[i-1][j]+v[i][j-1]+v[i][j+1]-4*v[i][j])/h2;
			var dudt=Du*lp_u-u[i][j]*v[i][j]*v[i][j]+f*(1.0-u[i][j]);
			var dvdt=Dv*lp_v+u[i][j]*v[i][j]*v[i][j]-(f+k)*v[i][j];

			u1[i][j]=u[i][j]+dt*dudt;
			v1[i][j]=v[i][j]+dt*dvdt;
		}
	}

	for(var i=1;i<=N;i++){
		for(var j=1;j<=N;j++){
			u[i][j]=u1[i][j];
			v[i][j]=v1[i][j];
		}
	}

	for(var i=1;i<=N;i++){
		for(var j=1;j<=N;j++){
			fieldU[i][j]=Math.floor(u[i][j]);
			fieldV[i][j]=Math.floor(v[i][j]);
		}
	}
	
}

function boundary() {
	for(var i=1;i<=N;i++) {
		u[i][0]=u[i][N];
		u[i][N+1]=u[i][1];
		u[0][i]=u[N][i];
		u[N+1][i]=u[1][i];

		v[i][0]=v[i][N];
		v[i][N+1]=v[i][1];
		v[0][i]=v[N][i];
		v[N+1][i]=v[1][i];
	}
}

function draw(){
	context.clearRect(0,0,N,N);
	if(isPeriodicBaundary)
		boundary();
	updateField();
	drawField();
}

function setTick(tick){
	this.tick=tick;
}

function reset(){
	initField();
	draw();
}

//Main
var ary_u8=image.data;
var w=image.width;
var h=image.height;

initField();
drawField();

timer=setInterval(draw,tick);

