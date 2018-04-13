import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

class Square extends React.Component {
  render() {
    if (this.props.highlight) {
      return (
        <button
          className="square"
          onClick={this.props.handleClick}
          style={{ color: "red" }}
        >
          {this.props.piece}
        </button>
      );
    } else {
      return (
        <button className="square" onClick={this.props.handleClick}>
          {this.props.piece}
        </button>
      );
    }
  }
}

class Board extends React.Component {
  render() {
    // 获取棋盘信息
    const boardStatus = this.props.boardStatus.slice();
    // 构建棋盘
    const board = Array(3).fill(null);
    for (let i = 0; i < board.length; i++) {
      // 构建棋盘的每一行
      let boardRow = Array(3).fill(null);
      for (let j = 0; j < boardRow.length; j++) {
        // 将棋盘每一格的信息填入
        let pos = parseInt(i * board.length + j, 10);
        boardRow[j] = (
          <Square
            key={j}
            piece={boardStatus[pos]}
            handleClick={() => this.props.handleClick(pos)}
            highlight={this.props.winLine && this.props.winLine.includes(pos)}
          />
        );
      }

      board[i] = (
        <div key={i} className="board-row">
          {boardRow}
        </div>
      );
    }

    return <div>{board}</div>;
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      boardStatus: Array(9).fill(null), // 棋盘状态
      nextPlayer: "X", // 当前要落子选手
      // 落子记录
      stepHistory: [
        {
          boardStatus: Array(9).fill(null),
          currPlayer: null,
          currPosition: 0
        }
      ],
      // 赢者信息
      winInfo: {
        winner: null,
        winLine: []
      }
    };
  }

  /**
   * 点击响应
   * @param {number} pos 点击的位置
   */
  handleClick(pos) {
    // 如果该位置有棋子或者已经结束游戏，那么无法点击棋盘
    if (this.state.boardStatus[pos] || this.state.winInfo.winner) {
      return;
    }

    let boardStatusCopy = this.state.boardStatus.slice();
    // 落子
    boardStatusCopy[pos] = this.state.nextPlayer;

    // 变化要落子的选手
    let nextPlayer = this.state.nextPlayer === "X" ? "O" : "X";

    let winInfo = this.getWinInfo(boardStatusCopy);

    let stepHistory = this.addHistory(boardStatusCopy, pos);

    this.setState({
      boardStatus: boardStatusCopy,
      nextPlayer: nextPlayer,
      stepHistory: stepHistory,
      winInfo: winInfo
    });
  }

  /**
   * 计算是否结束
   * @param {Array} boardStatus 棋盘状态
   * @returns {Object} 返回获胜信息
   */
  getWinInfo(boardStatus) {
    const possibleWin = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let i = 0; i < possibleWin.length; i++) {
      let [a, b, c] = possibleWin[i];
      // 如果一条线上都相同那么获胜
      if (
        boardStatus[a] &&
        boardStatus[a] === boardStatus[b] &&
        boardStatus[a] === boardStatus[c]
      ) {
        return {
          winner: boardStatus[a],
          winLine: [a, b, c]
        };
      }
    }

    for (let i = 0; i < boardStatus.length; i++) {
      // 如果还有位置没填上那么还没结束
      if (!boardStatus[i]) {
        return {
          winner: null,
          winLine: []
        };
      }
    }

    // 如果所有位置都填上了而且没有获胜者，那么平局
    return {
      winner: "=",
      winLine: []
    };
  }

  /**
   * 添加落子记录
   * @param {Array} boardStatus 棋盘状态
   * @param {number} pos 点击位置
   * @returns {Array} 返回增加后的历史列表
   */
  addHistory(boardStatus, pos) {
    let historyCopy = this.state.stepHistory.slice();
    historyCopy.push({
      boardStatus: boardStatus,
      currPlayer: this.state.nextPlayer,
      currPosition: pos
    });
    return historyCopy;
  }

  /**
   * 跳转到对应的历史
   * @param {number} index 历史编号
   */
  jumpTo(index) {
    const singleHistory = this.state.stepHistory[index];
    this.setState({
      boardStatus: singleHistory.boardStatus
    });
  }

  render() {
    let gameInfo = null;
    if (this.state.winInfo) {
      switch (this.state.winInfo.winner) {
        case "X":
          gameInfo = "X Win!";
          break;
        case "O":
          gameInfo = "O Win!!";
          break;
        case "=":
          gameInfo = "Draw!!!";
          break;

        default:
          gameInfo = "Next player is " + this.state.nextPlayer;
          break;
      }
    } else {
      gameInfo = "Next player is " + this.state.nextPlayer;
    }

    let historyList = null;
    if (this.state.winInfo && this.state.winInfo.winner) {
      // 如果结束了那么显示历史
      historyList = this.state.stepHistory.map((step, index) => {
        const pos = step.currPosition;
        const historyTitle = index
          ? `${step.currPlayer} (${parseInt(pos / 3, 10) + 1}, ${pos % 3 + 1})`
          : "Game Start";
        return (
          <li key={index}>
            <button onClick={() => this.jumpTo(index)}>{historyTitle}</button>
          </li>
        );
      });
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            boardStatus={this.state.boardStatus}
            handleClick={i => this.handleClick(i)}
            winLine={this.state.winInfo.winLine}
          />
        </div>
        <div className="game-info">
          <div>{gameInfo}</div>
          <ol>{historyList}</ol>
        </div>
      </div>
    );
  }
}

//============================================
ReactDOM.render(<Game />, document.getElementById("root"));
