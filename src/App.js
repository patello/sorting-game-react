import React from 'react';

import './App.css';
import backicon from './back.svg';

function getAIHint(gridValues,selectedPiece,otherPieces, callback){
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
    callback
  ).catch(error => {/*maybe add some state update here to show that backend is offline*/});
};

var GridItem = (props) => {
  const displayValue = (props.value > 0) ? props.value : "";
  //Class doesn't seem to actually work in any browser that I've tried. :hover doesn't fire when you are dragging.
  const droppableClass = ((props.value === 0) && (props.dragging)) ? "droppable-item" : "";
  const dragOver = (ev) => {
    if(typeof props.dropFunction !== 'undefined'){
      ev.preventDefault();
    }
  }
  const drop = (ev) => {
    ev.preventDefault();
    //Don't set drop function for the opponents grid. Pieces can't be dropped here
    if(typeof props.dropFunction !== 'undefined'){
      props.dropFunction(props.index,ev.dataTransfer.getData("value"),ev.dataTransfer.getData("index"))
    }
  }
  if (props.value === 0){
    return(
      <div
        style={{
          background:`rgba(${255-255*props.opacity}, ${255-131*props.opacity}, ${255-56*props.opacity}, 1)`,
          gridRow : `${"tile-row-start "+(props.row+1)}`,
          gridColumn : `${"tile-col-start "+(props.col+1)}`
        }}
        className={droppableClass + " gridItem"}
        onDrop={drop} 
        onDragOver={dragOver}
      >
        {displayValue}
      </div>
    );
  }
  return(
    <div 
      className = "gridItem"
      style={{
        gridRow : `${"tile-row-start "+(props.row+1)}`,
        gridColumn : `${"tile-col-start "+(props.col+1)}`
      }}
    >
        {displayValue}
    </div>);
}

var Grid = (props) => {
  //TODO: Consider iterating over the props instead, like for (const [index, value] of props.values.entries()). Could be more dynamic
  const items = [];

  //Create game tiles
  for (let i=0; i < 4*4; i++){
    let itemCol = i % 4;
    let itemRow = Math.floor(i/4);
    let gridItemIndex = itemRow*4 + itemCol;
    items.push(<GridItem key={items.length} opacity={props.helpValues[gridItemIndex]} value={props.values[gridItemIndex]} index={gridItemIndex} row={itemRow} col={itemCol} dropFunction={props.dropFunction} dragging={props.dragging}/>);
  }

  //Create vertical results
  for(let i=0; i < 4; i++){
    items.push(<ResultItem key={items.length} show={props.showResults} value={props.results[i]} index={i} vertical={true}/>);
  }

  //Create horizontal results
  for(let i=0; i < 4; i++){
    items.push(<ResultItem key={items.length} show={props.showResults} value={props.results[4+i]} index={i} vertical={false}/>);
  }
  
  if(props.main === true){
    //Create pieces
    for(let i=0; i < 4; i++){
      items.push(<PieceItem key={items.length} value={props.pieceValues[i]} index={i} toggleDragging={props.toggleDragging}/>);
    }
    items.push(<div key={items.length} className="piece-grid"></div>)
    items.push(<button key={items.length} className="button" id="reset-button" type="button" onClick={props.reset}>Reset</button>);
    items.push(
      <button type="button" className="button" id="back-button" onClick={props.goBack}>
          <img src={backicon} className="selection-icon" alt="Go back" />
      </button>
    );
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

  const style={
    gridRow : `${"piece-row-start "}`,
    gridColumn : `${"tile-col-start "+(props.index+1)}`
  }

  return(
    <div className={"pieceItem "+elementClass} draggable={draggable} onDragStart={drag} onDragEnd={dragEnd} style={style}>{displayValue}</div>
  );  
}

var PieceRow = (props) => {
  const items = []

  for (const [index, value] of props.values.entries()) {
    items.push(<PieceItem key={index} value={value} index={index} toggleDragging={props.toggleDragging}/>)
  }
  items.push(<button className="reset-button" type="button" onClick={props.reset}>Reset</button>)
  return (
      <div className="piece-grid">{items}</div>
  );
}

var ResultItem = (props) => {
  const visibility = (props.show) ? "visible":"hidden";
  const symbol = props.value ? "✓" : "X"
  const gridRow = (props.vertical?"tile-row-start "+(props.index+1) : "result-row-start");
  const gridCol = (props.vertical?"result-col-start" : "tile-col-start "+(props.index+1));
  return <div 
    class="resultItem" 
    style={{
      visibility: visibility,
      gridRow : gridRow,
      gridColumn : gridCol,
    }} 
    key={props.key}>
        {symbol}
    </div>
}


class App extends React.Component{
  constructor(props){
    super(props);
    this.toggleDragging = this.toggleDragging.bind(this);
    this.movePiece = this.movePiece.bind(this);
    this.reset = this.reset.bind(this);
    const generatedPieces=this.generatePieces(16);
    this.state = {
      round : 0,
      pieces : generatedPieces,
      gridValues : new Array(16).fill(0),
      gridValuesOpponent : new Array(16).fill(0),
      dragging : false,
      results : new Array(8).fill(false),
      resultsOpponent : new Array(8).fill(false),
      done : false,
      hintPolicy : new Array(16).fill(0),
      hintAction : 0,
    }
  }

  reset(){
    const generatedPieces=this.generatePieces(16);
    this.setState({
      round : 0,
      pieces : generatedPieces,
      gridValues : new Array(16).fill(0),
      gridValuesOpponent : new Array(16).fill(0),
      dragging : false,
      done : false,
    })
  }

  toggleDragging(bDragging, index){
    if (bDragging && this.props.aiHelp){
      getAIHint.call(this,this.state.gridValues,this.state.pieces[index+this.state.round*4],this.state.pieces.slice(this.state.round*4,index+this.state.round*4).concat(this.state.pieces.slice(index+this.state.round*4+1,this.state.round*4+4)),data => this.setState({hintAction:data.action,hintPolicy:data.policy}));
    }
    else
    {
      this.setState({
        hintPolicy : new Array(16).fill(0),
        hintAction : 0,
      });
    }
    this.setState({dragging : bDragging})
  }

  generatePieces(nrOfPiece = 16){
    var pieceList = []
    var i;
    for(i=0; i < nrOfPiece; i++)
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
    var newPieces = this.state.pieces;

    newGrid[gridIndex] = parseInt(pieceValue);
    if(this.props.aiOpponent){
      let piece = parseInt(pieceValue);
      let index = parseInt(pieceIndex);
      getAIHint.call(this,
        this.state.gridValuesOpponent,
        piece,
        this.state.pieces.slice(this.state.round*4,index+this.state.round*4).concat(this.state.pieces.slice(index+this.state.round*4+1,this.state.round*4+4)), 
        data=>{
          let newGridOpponent = this.state.gridValuesOpponent;
          newGridOpponent[data.action]=piece;
          this.setState({gridValuesOpponent:newGridOpponent})
        })
    }
    newPieces[parseInt(pieceIndex)+this.state.round*4] = 0;
    if (newGrid.every(item => item !== 0)){
      var newResults = new Array(8).fill(true);
      var newResultsOpponent = new Array(8).fill(true);
      var i, j, lastValX, lastValY, lastValXOpponent, lastValYOpponent;
      for(i=0; i < 4; i++)
      {
        lastValX = 0;
        lastValXOpponent = 0;
        lastValY = 0;
        lastValYOpponent = 0;
        for(j=0; j < 4; j++)
        {
          if(this.state.gridValues[i*4+j]<lastValX){
            newResults[i]=false;
          }
          if(this.state.gridValuesOpponent[i*4+j]<lastValXOpponent){
            newResultsOpponent[i]=false;
          }
          if(this.state.gridValues[j*4+i]<lastValY){
            newResults[4+i]=false;
          }
          if(this.state.gridValuesOpponent[j*4+i]<lastValYOpponent){
            newResultsOpponent[4+i]=false;
          }
          lastValX=this.state.gridValues[i*4+j]
          lastValXOpponent=this.state.gridValuesOpponent[i*4+j]
          lastValY=this.state.gridValues[j*4+i]
          lastValYOpponent=this.state.gridValuesOpponent[j*4+i]
        }
      }
      this.setState({
        results:newResults,
        resultsOpponent:newResultsOpponent,
        done:true
      });
    } 
    else {
      if (newPieces.slice(this.state.round*4, this.state.round*4+4).every(item => item === 0)) {
        newRound = newRound + 1;
      }
    }
    this.setState ({
      round : newRound,
      gridValues : newGrid,
      pieces : newPieces,
      dragging : false,
      hintPolicy : new Array(16).fill(0),
      hintAction : 0,
    })
  }
  render() {
    if(this.props.aiOpponent){
      return (
        <div className="app-grid--with-opponent">
          <Grid main={true} values={this.state.gridValues} results={this.state.results} showResults={this.state.done} helpValues={this.state.hintPolicy} dragging={this.state.dragging} dropFunction={this.movePiece} pieceValues={this.state.pieces.slice(this.state.round*4,this.state.round*4+4)} toggleDragging={this.toggleDragging} reset={this.reset} goBack={()=>this.props.goBack}/>
          <Grid main={false} values={this.state.gridValuesOpponent} results={this.state.resultsOpponent} showResults={this.state.done}  helpValues={false} />
          <div/>
        </div>
      );
    } else {
      return (
        <div className="app-grid">
          <Grid main={true} values={this.state.gridValues} results={this.state.results} showResults={this.state.done} helpValues={this.state.hintPolicy} dragging={this.state.dragging} dropFunction={this.movePiece} pieceValues={this.state.pieces.slice(this.state.round*4,this.state.round*4+4)} toggleDragging={this.toggleDragging} reset={this.reset} goBack={this.props.goBack}/>
        </div>
      );
    }
  }
}

App.defaultProps = {
  aiHelp: false,
  aiOpponent: false,
};

export default App;
