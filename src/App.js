import React from 'react';

import './App.css';

var GridItem = (props) => {
  const displayValue = (props.value > 0) ? props.value : "[]";
  const dragOver = (ev) => {
    ev.preventDefault();
  }
  const drop = (ev) => {
    ev.preventDefault();
    props.dropFunction(props.index,ev.dataTransfer.getData("value"),ev.dataTransfer.getData("index"))
  }
  return(
    <div 
      class="item" 
      onDrop={drop} 
      onDragOver={dragOver}>
      {displayValue}
    </div>
  );
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
  const draggable = props.value > 0
  const drag = function(ev){
    ev.dataTransfer.setData("value", props.value);
    ev.dataTransfer.setData("index", props.index);
  }
  return(
    <div class="item" draggable={draggable} onDragStart={drag}>{displayValue}</div>
  );  
}

var PieceRow = (props) => {
  const items = []

  for (const [index, value] of props.values.entries()) {
    items.push(<PieceItem key={index} value={value} index={index}/>)
  }
  return (
      <div class="grid">{items}</div>
  );
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.movePiece = this.movePiece.bind(this);
    this.state = {
      round : 1,
      pieces : [5,1,2,4,10,19,20,40,21,22,31,26,7,5,4,3],
      gridValues : new Array(16).fill(0),
      pieceValues : [5,1,2,4]
    }
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
