import React from 'react';

import './App.css';

var GridItem = (props) => {
  const displayValue = (props.value > 0) ? props.value : "";
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
        onDrop={drop} 
        onDragOver={dragOver}>
        {displayValue}
      </div>
    );
  }
  return(<div>{displayValue}</div>);
}

var Grid = (props) => {

  const items = []

  for (const [index, value] of props.values.entries()) {
    items.push(<GridItem key={index} value={value} index={index} dropFunction={props.dropFunction}/>)
  }
  return (
      <div class="grid">{items}</div>
  );
}

var PieceItem = (props) => {
  const displayValue = (props.value > 0) ? props.value : "";
  const elementClass = (props.value > 0) ? "activePiece" : "inactivePiece";
  const draggable = props.value > 0
  const drag = function(ev){
    ev.dataTransfer.setData("value", props.value);
    ev.dataTransfer.setData("index", props.index);
  }
  return(
    <div class={elementClass} draggable={draggable} onDragStart={drag}>{displayValue}</div>
  );  
}

var PieceRow = (props) => {
  const items = []

  for (const [index, value] of props.values.entries()) {
    items.push(<PieceItem key={index} value={value} index={index}/>)
  }
  return (
      <div class="grid pieceGrid">{items}</div>
  );
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.movePiece = this.movePiece.bind(this);
    const generatedPieces=this.generatePieces();
    this.state = {
      round : 1,
      pieces : generatedPieces,
      gridValues : new Array(16).fill(0),
      pieceValues : generatedPieces.slice(0,4)
    }
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

    newGrid[gridIndex] = pieceValue;
    newPieceRow[pieceIndex] = 0;
    if (newGrid.every(item => item !== 0)){
      console.log("The end!")
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
      pieceValues : newPieceRow
    })
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Grid values={this.state.gridValues} dropFunction={this.movePiece}/>
          <br/>
          <PieceRow values={this.state.pieceValues}/>
        </header>
      </div>
    );
  }
}



export default App;
