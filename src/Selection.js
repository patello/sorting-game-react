import React from 'react';

import soloicon from './solo.svg';
import helpicon from './help.svg';
import opponenticon from './opponent.svg';

import './Selection.css';

import App from './App';

class Selection extends React.Component{
    constructor(props){
      super(props);
      this.goBack = this.goBack.bind(this)
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
    //Wasn't able to propagate twice by only binding the function like I do with selectMode
    //https://stackoverflow.com/questions/32317154/react-uncaught-typeerror-cannot-read-property-setstate-of-undefined
    goBack() {
        this.setState(
            {selection:false}
        )
    }
    render() {
        if(this.state.selection){
            return (
                <div>
                    <App aiHelp={this.state.aiHelp} aiOpponent={this.state.aiOpponent} goBack={this.goBack}/>
                </div>
            );
        } else {
            return (
                <grid className="selection-grid">
                    <button type="button" className="selection-button" onClick={()=>this.selectMode(false,false)}>
                        <img src={soloicon} className="selection-icon" alt="Play solo" />
                        <div className="selection-text">Play Solo</div>
                    </button>
                    <button type="button" className="selection-button" onClick={()=>this.selectMode(true,false)}>
                        <img src={helpicon} className="selection-icon" alt="Play with AI help" />
                        <div className="selection-text">Play With AI</div>
                    </button>
                    <button type="button" className="selection-button" onClick={()=>this.selectMode(false,true)}>
                        <img src={opponenticon} className="selection-icon" alt="Play against AI opponent" />
                        <div className="selection-text">Play Against AI</div>
                    </button>
                </grid>
            );
        }
    }
}

export default Selection;