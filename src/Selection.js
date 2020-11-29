import React from 'react';

import soloicon from './solo.svg';
import helpicon from './help.svg';
import opponenticon from './opponent.svg';
import backicon from './back.svg';

import './Selection.css';

import App from './App';

class Selection extends React.Component{
    constructor(props){
      super(props);
      this.selectMode.bind(this);
      this.goBack.bind(this);
      this.state = {
          selection: false,
          aiHelp: false,
          aiOpponent: false,
      }
    }
    selectMode(aiHelp,aiOpponent){
        this.setState(
            {
                selection:true,
                aiHelp:aiHelp,
                aiOpponent:aiOpponent,
            }
        )
    }
    goBack(){
        this.setState(
            {selection:false}
        )
    }
    render() {
        if(this.state.selection){
            return (
                <div>
                    <button type="button" className="back-button" onClick={()=>this.goBack()}>
                        <img src={backicon} className="selection-icon" alt="Go back" />
                    </button>
                    <App aiHelp={this.state.aiHelp} aiOpponent={this.state.aiOpponent}/>
                </div>
            );
        } else {
            return (
                <div>
                    <button type="button" className="selection-button" onClick={()=>this.selectMode(false,false)}>
                        <img src={soloicon} className="selection-icon" alt="Play solo" />
                        <div className="selection-text">Play Solo</div>
                    </button>
                    <button type="button" className="selection-button" onClick={()=>this.selectMode(true,false)}>
                        <img src={helpicon} className="selection-icon" alt="Play with AI help" />
                        <div className="selection-text">Play with AI Help</div>
                    </button>
                    <button type="button" className="selection-button" onClick={()=>this.selectMode(false,true)}>
                        <img src={opponenticon} className="selection-icon" alt="Play against AI opponent" />
                        <div className="selection-text">Play Against AI</div>
                    </button>
                </div>
            );
        }
    }
}

export default Selection;