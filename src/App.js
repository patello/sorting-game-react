import React from 'react';

import './App.css';

function getAIHint(gridValues,selectedPiece,otherPieces){
  const path = "/api/";
  const payload = {
      board: gridValues,
      selected_brick:selectedPiece,
      other_bricks:otherPieces,
  };
  
  fetch(path,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify( payload )
    }
  ).then(
    response => {
      if(response.ok){
        return response.json()
      }
      throw Error(response.statusText)
    }
  ).then(
    data => this.setState({helpAction:data.action,helpPolicy:data.policy})
  ).catch(error => {/*maybe add some state update here to show that backend is offline*/});
};

var GridItem = (props) => {
  const displayValue = (props.value > 0) ? props.value : "";
  //Class doesn't seem to actually work in any browser that I've tried. :hover doesn't fire when you are dragging.
  const droppableClass = ((props.value === 0) && (props.dragging)) ? "droppable-item" : "";
  const dragOver = (ev) => {
    ev.preventDefault();
  }
  const drop = (ev) => {
    ev.preventDefault();
    props.dropFunction(props.index,ev.dataTransfer.getData("value"),ev.dataTransfer.getData("index"))
  }
  if (props.value === 0){
    return(
      <div
        style={{background:`rgba(${255-255*props.opacity}, ${255-131*props.opacity}, ${255-56*props.opacity}, 1)`}}
        className={droppableClass}
        onDrop={drop} 
        onDragOver={dragOver}
      >
        {displayValue}
      </div>
    );
  }
  return(<div>{displayValue}</div>);
}

var Grid = (props) => {

  const items = []

  for (const [index, value] of props.values.entries()) {
    items.push(<GridItem key={index} opacity={props.helpValues[index]} value={value} index={index} dropFunction={props.dropFunction} dragging={props.dragging}/>)
  }
  return (
      <div className="grid">{items}</div>
  );
}

var PieceItem = (props) => {
  const displayValue = (props.value > 0) ? props.value : "";
  const elementClass = (props.value > 0) ? "active-piece" : "inactive-piece";
  const draggable = props.value > 0
  const drag = function(ev){
    ev.dataTransfer.setData("value", props.value);
    ev.dataTransfer.setData("index", props.index);
    props.toggleDragging(true, props.index);
  }
  const dragEnd = function(ev){
    props.toggleDragging(false, -1);
  }
  return(
    <div className={elementClass} draggable={draggable} onDragStart={drag} onDragEnd={dragEnd}>{displayValue}</div>
  );  
}

var PieceRow = (props) => {
  const items = []

  for (const [index, value] of props.values.entries()) {
    items.push(<PieceItem key={index} value={value} index={index} toggleDragging={props.toggleDragging}/>)
  }
  return (
      <div className="grid piece-grid">{items}</div>
  );
}

var ResultFields = (props) => {
  const visibility = (props.show) ? "visible":"hidden";
  const items = [];
  const directionClass = (props.direction==="horizontal") ? "results-field--horizontal" : "results-field--vertical";
  const symbols = props.values.map(val => {
    return val ? "✓" : "X"
  })
  for (const [index, value] of symbols.entries()) {
    items.push(<div key={index}>{value}</div>)
  }

  return(
    <div style={{visibility: visibility}}className={"results-field "+directionClass}>{items}</div>
  )
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.toggleDragging = this.toggleDragging.bind(this);
    this.movePiece = this.movePiece.bind(this);
    this.reset = this.reset.bind(this);
    const generatedPieces=this.generatePieces();
    this.state = {
      round : 1,
      pieces : generatedPieces,
      gridValues : new Array(16).fill(0),
      pieceValues : generatedPieces.slice(0,4),
      dragging : false,
      results : new Array(8).fill(false),
      done : false,
      helpPolicy : new Array(16).fill(0),
      helpAction : 0,
    }
  }

  reset(){
    const generatedPieces=this.generatePieces();
    this.setState({
      round : 1,
      pieces : generatedPieces,
      gridValues : new Array(16).fill(0),
      pieceValues : generatedPieces.slice(0,4),
      dragging : false,
      done : false,
    })
  }

  toggleDragging(bDragging, index){
    if (bDragging){
      getAIHint.call(this,this.state.gridValues,this.state.pieceValues[index],this.state.pieceValues.slice(0,index).concat(this.state.pieceValues.slice(index+1,4)));
    }
    else
    {
      this.setState({
        helpPolicy : new Array(16).fill(0),
        helpAction : 0,
      });
    }
    this.setState({dragging : bDragging})
  }

  generatePieces(){
    var pieceList = []
    var i;
    for(i=0; i < 40; i++)
    {
      var newPiece = Math.floor(Math.random() * 40) + 1;
      while(pieceList.includes(newPiece))
      {
        newPiece = Math.floor(Math.random() * 40) + 1; 
      }
      pieceList.push(newPiece)
    }
    return(pieceList)
  }

  movePiece(gridIndex,pieceValue,pieceIndex) {
    var newRound = this.state.round;
    var newGrid = this.state.gridValues;
    var newPieceRow = this.state.pieceValues;

    newGrid[gridIndex] = parseInt(pieceValue);
    newPieceRow[pieceIndex] = 0;
    if (newGrid.every(item => item !== 0)){
      var newResults = new Array(8).fill(true);
      var i, j, lastValX, lastValY;
      for(i=0; i < 4; i++)
      {
        lastValX = 0;
        lastValY = 0;
        for(j=0; j < 4; j++)
        {
          if(this.state.gridValues[i*4+j]<lastValX){
            newResults[i]=false;
          }
          if(this.state.gridValues[j*4+i]<lastValY){
            newResults[4+i]=false;
          }
          lastValX=this.state.gridValues[i*4+j]
          lastValY=this.state.gridValues[j*4+i]
        }
      }
      this.setState({
        results:newResults,
        done:true
      });
    } 
    else {
      if (newPieceRow.every(item => item === 0)) {
        newRound = newRound + 1;
        newPieceRow = this.state.pieces.slice((newRound-1)*4,4+(newRound-1)*4)
      }
    }
    this.setState ({
      round : newRound,
      gridValues : newGrid,
      pieceValues : newPieceRow,
      dragging : false,
      helpPolicy : new Array(16).fill(0),
      helpAction : 0,
    })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="app-grid">
            <Grid values={this.state.gridValues} helpValues={this.state.helpPolicy} dragging={this.state.dragging} dropFunction={this.movePiece}/>
            <ResultFields values={this.state.results.slice(0,4)} show={this.state.done} direction="vertical"/>
            <ResultFields values={this.state.results.slice(4,8)} show={this.state.done} direction="horizontal"/>
            <div/>
            <PieceRow values={this.state.pieceValues} toggleDragging={this.toggleDragging}/>
            <button type="button" onClick={this.reset}>Reset</button>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
