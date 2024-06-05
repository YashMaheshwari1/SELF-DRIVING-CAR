const carcanvas = document.getElementById("carCanvas");
carcanvas.width=700;
const networkcanvas = document.getElementById("networkCanvas");
networkcanvas.width=400;
  // M1 start
const N = 1;
const laneCount=20;
const carlane=3;
const car_maxspeed=3;
const dummycar_maxspeed=2;
const car_color="blue";
const traffic_count=48;
let dummycar_color=[traffic_count];
dummycar_color=["deeppink","red","springgreen","salmon","sandybrown","orangered","mediumslateblue","red","hotpink","gold","darkgoldenrod","coral","chartreuse","tan","teal","magenta","olive","mediumpurple","green","purple","yellow",
                "cyan","orange","pink","deeppink","red","springgreen","salmon","sandybrown","orangered","mediumslateblue","red","hotpink","gold","darkgoldenrod","coral","chartreuse","tan","teal","magenta","olive","mediumpurple",
                "green","purple","yellow","cyan","orange","pink"];
const road_color="lightgrey";
const damage_color="grey";                                  
const sensor_color="lightyellow";
  // M2 stop
const carctx = carcanvas.getContext("2d");
const networkctx = networkcanvas.getContext("2d");
const road = new Road(carcanvas.width/2,carcanvas.width*0.9,laneCount);
const cars = generateCars(N);
const traffic = generateTraffic(traffic_count);
let bestCar=cars[0];
if(localStorage.getItem("bestBrain"))
{
    for(let i=0;i<cars.length;i++)
    {
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain")
        );
        // localstorage only works with string
        if(i!=0)
        {
            NeuralNetwork.mutate(cars[i].brain,0.2);
        }
    }
}

function generateTraffic(traffic_count)
{
    let x=100;
    const traffic=[];
    for(let i=0;i<traffic_count;i++)
    {
        traffic.push(new Car(road.getLaneCenter(Math.floor(Math.random()*(laneCount+1))),-x,30,50,"DUMMY",dummycar_maxspeed,dummycar_color[i]));
        x +=120;
    }
    return traffic;
}

animate();

function save()
{
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain)
    );
}

function discard()
{
    localStorage.removeItem("bestBrain");
}

function generateCars(N)
{
    const cars=[];
    for(let i=1;i<=N;i++)
    {
        cars.push(new Car(road.getLaneCenter(carlane),100,30,50,"AI",car_maxspeed,car_color));
    }
    return cars;
}

function animate(time)
{
    for(let i=0;i<traffic.length;i++)
    {
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++)
    {
        cars[i].update(road.borders,traffic);
    }
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        )
    );          // Math.min work with different values but not with array,thats why we use ...

    carcanvas.height=window.innerHeight;
    networkcanvas.height=window.innerHeight;

    carctx.save();
    carctx.translate(0,-bestCar.y+carcanvas.height*0.7);   // for put camera over car
    road.draw(carctx,road_color);
    for(let i=0;i<traffic.length;i++)
    {
        traffic[i].draw(carctx);
    }
    carctx.globalAlpha=0.2;    // for make cars transparent
    for(let i=0;i<cars.length;i++)
    {
        cars[i].draw(carctx);
    }
    carctx.globalAlpha=1;
    bestCar.draw(carctx,true);

    carctx.restore();

    networkctx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkctx,bestCar.brain);
    requestAnimationFrame(animate);
}
