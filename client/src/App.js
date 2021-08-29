import {Button, Navbar, Container, Row, Col, Card} from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { getWeb3, getLottery, getBanana, disconnect, connect } from './utils.js';
import './App.css';
import { ReactComponent as YourSvg } from './images/apeswap-main.svg';
import MyModal from './Modal.js';
import { BsBoxArrowUpRight } from "react-icons/bs"
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import firebase from './firebase';

function App() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);

  const ref = firebase.firestore().collection("rounds");





  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [lottery, setLottery] = useState(undefined);
  const [banana, setBanana] = useState(undefined);
  const [approvedBananaAmount, setApprovedBananaAmount] = useState(undefined);
  const [alreadyEntered, setAlreadyEntered] = useState(false);
  const [bananaFee, setBananaFee] = useState(undefined);
  const [contractBananaBalance, setContractBananaBalance] = useState(undefined);
  const [userBananaBalance, setUserBananaBalance] = useState(undefined);
  const [admin, setAdmin] = useState(undefined);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [showTwoButtons, setShowTwoButtons] = useState(true);
  const [depositButtonText, setDepositButtonText] = useState('Enter');
  const [lotteryResults, setLotteryResults] = useState([]);
  const [lotteryId, setLotteryId] = useState(undefined);

  const [modalShow, setModalShow] = useState(false);
  const [completedRound, setCompletedRound] = useState(false);
  const [nextDrawDate, setNextDrawDate] = useState(undefined);

  const [lotteryResultsIndex, setLotteryResultsIndex] = useState(0);

  function getRounds() {
    setLoading(true);
    ref.onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setRounds(items);
      setLoading(false);
    })
  }

  function getRounds2() {
    setLoading(true);
    ref.get().then((item) => {
      const items = item.docs.map((doc) => doc.data());
      setRounds(items);
      setLoading(false);
    })
  }

  function getButtonsRow() {
      return (
        <div>
          <table border="2">
            <tr>
              <td>Row 1 Col 1</td>
              <td>Row 1 Col 2</td>
            </tr>
            <tr>
              <td>Row 2 Col 1</td>
              <td>Row 2 Col 2</td>
            </tr>
            <tr>
              <td>Row 3 Col 1</td>
              <td>Row 3 Col 2</td>
            </tr>
          </table>
        </div>
      );
}

function getTime(timestamp) {
      const dateTime = new Date(timestamp *1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = dateTime.getFullYear();
      var month = months[dateTime.getMonth()];
      var date = dateTime.getDate();
      let hour = dateTime.getHours();
      hour = ("0" + hour).slice(-2);
      let min = dateTime.getMinutes();
      min = ("0" + min).slice(-2);
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
      return time;
}

 

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const lottery = await getLottery(web3);
      const banana = await getBanana(web3);
      const approvedBanana = await banana.methods.allowance(accounts[0], lottery.options.address).call().valueOf();
      const admin = await lottery.methods.admin().call();
      const currentLotteryIdString = await lottery.methods.lotteryId().call();
      const currentLotteryIdNumber = parseInt(currentLotteryIdString);
      const fee = await lottery.methods.getBananaFee().call();
      const players = await lottery.methods.getPlayerList().call();
      const contractBalance = await banana.methods.balanceOf(lottery.options.address).call();
      let contractBalanceConverted = web3.utils.fromWei(contractBalance, 'ether');
      const userBalance = await banana.methods.balanceOf(accounts[0]).call();
      let userBalanceConverted = web3.utils.fromWei(userBalance, 'ether');
      let resultsArray = [];




      //getRounds();
      //getRounds2();

      for (var i = 0; i < currentLotteryIdNumber; i++)
      {
        const result = await lottery.methods.lotteryResults(i).call();
        var time = getTime(result.date);
        result.date = time
        resultsArray.push(result);
      }
  
      let entered = false;
      for(const player of players){
        if(accounts[0] === player) entered = true; 
      } 

      var nextTime = getTime(1629658800);
      setNextDrawDate(nextTime);
      setWeb3(web3);
      setAccounts(accounts);
      setLottery(lottery);
      setBanana(banana);
      setApprovedBananaAmount(parseInt(approvedBanana));
      setAlreadyEntered(entered);
      if(entered) setDepositButtonText('Already entered')
      setBananaFee(fee);
      setAdmin(admin);
      setContractBananaBalance(contractBalanceConverted);
      if(parseInt(approvedBanana) > 2) setShowTwoButtons(false);
      setLotteryId(currentLotteryIdNumber);
      setLotteryResults(resultsArray);
      if(resultsArray.length > 0) setLotteryResultsIndex(resultsArray.length -1);
    
    };
    init();
  }, []);


  const updateBananaBalance = async () => {
    const contractBalance = await banana.methods.balanceOf(lottery.options.address).call();
      let contractBalanceConverted = web3.utils.fromWei(contractBalance, 'ether');
      setContractBananaBalance(contractBalanceConverted);
  }

  const deposit = async ()=> {

    await lottery.methods.deposit().send({from: accounts[0]});
    await updateBananaBalance();
    const players = await lottery.methods.getPlayerList().call();    
    let entered = false;

      for(const player of players){
        if(accounts[0] === player) entered = true; 
      } 
      
      setAlreadyEntered(entered);
      setDepositButtonText('Already entered');
  }

  const disconnectWallet = async () => {
    await disconnect(web3);
  }


  const connectWallet = async () => {
    await connect(web3);
  }


  const passedFunction = () => {}

  const hideModal = async (toDisconnect) => {
    setModalShow(false);
    if(toDisconnect){
      await disconnect(web3);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
    }
  }

  const cycleLottery = (direction) => {

    if(direction === 'left'){
      setLotteryResultsIndex(lotteryResultsIndex - 1);
    } else {
      setLotteryResultsIndex(lotteryResultsIndex + 1);
    }

  }

 

  const approveBanana = async ()=> {
    setLoadingApproval(true);
    await banana.methods
    .approve(lottery.options.address, web3.utils.toBN(2).pow(web3.utils.toBN(256)).sub(web3.utils.toBN(1)))
    .send({from: accounts[0]});
    const approvedBanana = await banana.methods.allowance(accounts[0], lottery.options.address).call().valueOf();
    setApprovedBananaAmount(parseInt(approvedBanana));
    setLoadingApproval(false);  
  }

  const completeRound = async ()=> {
    const txHash = await lottery.methods.completeRound().send({from: accounts[0]});
    console.log('this is the tx hash');
    console.log(txHash.transactionHash);
    setCompletedRound(true);
  }

  //show a loading screen if we don't have everything initialised
  if(
    typeof web3 === 'undefined'
    || typeof accounts === 'undefined'
    || typeof lottery === 'undefined'
  ) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <Navbar className="nav">
 
      <Navbar.Brand href="#home">
        <YourSvg className="d-inline-block align-top nav-logo"/>{' '}
      Banana Lottery
      </Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      {typeof accounts == 'undefined' ? <Button>Connect</Button> : <Button className={modalShow ? "logged-in-button-focused" : "logged-in-button"} onClick={(e) => {
        e.currentTarget.blur();
        setModalShow(true);
        }}>{accounts[0].substr(0,4) + '...' + accounts[0].slice(-4)}</Button>}
    </Navbar.Collapse>
 
</Navbar>
{/* <h1>Rounds</h1>
{rounds.map((round) => (
  <div key={round.winnings}>
    <p>winnings: {round.winnings.toString()}</p>

  </div>
))} */}
<Container>
<Card className="text-center card">
<YourSvg className="logo"/>
  <Row>
    <Col align="center" className="lottery-title">Banana Lottery</Col>
  </Row>
</Card>
</Container>
<Container>
<Card className="text-center card">
  <Card.Header className="card-header">
  <div className="card-enter-heading">
    <div className="next-draw">Next Draw</div>
    <div className="next-date">{nextDrawDate}</div>
   
 
  </div>
  </Card.Header>
  <div className="lottery-title">Current Banana Jackpot: {contractBananaBalance}</div>
  <div style={{height: "20px"}}></div>
  {alreadyEntered ?
  approvedBananaAmount > 2 ? <div className="deposit-enter-row"><Button disabled={alreadyEntered} className="button" onClick={() => deposit()}>{depositButtonText}</Button></div> : <div className="deposit-enter-row"><Button onClick={() => approveBanana()} className="button">Approve</Button><Button disabled={alreadyEntered || approvedBananaAmount < 2} className="button" onClick={() => deposit()}>{depositButtonText}</Button></div> : 
  approvedBananaAmount > 2 ?   <div className="deposit-enter-row"><Button disabled={alreadyEntered} className="button" onClick={() => deposit()}>{depositButtonText}</Button></div> : <div className="deposit-enter-row"><Button onClick={() => approveBanana()} className="button" disabled={approvedBananaAmount > 2}>Approve</Button><Button disabled={alreadyEntered} className="button" onClick={() => deposit()}>{depositButtonText}</Button></div>}
  <div style={{height: "20px"}}></div>
  <Container className="text-center how-to-play-text">Current entry fee: 2 Banana</Container>
  <div style={{height: "20px"}}></div>
</Card>
</Container>
{accounts[0] === admin ? <Container>
<Card className="text-center card">
  <div className="lottery-title">Complete Round</div>
  <div style={{height: "20px"}}></div>
  <div><Button disabled={completedRound} className="button" onClick={() => completeRound()}>Pick Winner</Button></div>
  <div style={{height: "20px"}}></div>
</Card>
</Container> : null}
{lotteryResults.length === 0 ? null :
<div>
<Container className="text-center how-to-play-heading">Finished Rounds</Container>
<br/>
<Container>
<Card className="text-center card">
  <Card.Header className="card-header">
  <div className="card-enter-heading">
    <div className="next-draw">Round {lotteryResultsIndex + 1}: {lotteryResults[lotteryResultsIndex].date}</div>
    <div className="next-date"><IconButton style={lotteryResultsIndex === 0 ? { color: "grey" } : { color: "white" }} onClick={() => cycleLottery('left')} disabled={lotteryResultsIndex === 0}>
    <ArrowBackIcon />
    </IconButton>
    <IconButton style={lotteryResultsIndex + 1 === lotteryResults.length ? { color: "grey" } : { color: "white" }} onClick={() => cycleLottery('right')} disabled={lotteryResultsIndex + 1 === lotteryResults.length}>
    <ArrowForwardIcon />
    </IconButton></div>
  </div>
  </Card.Header>
  <div className="previous-text">Banana Jackpot: {lotteryResults[lotteryResultsIndex].winnings}</div>
  <div className="previous-text">Winner: {lotteryResults[lotteryResultsIndex].addr}</div>
  <div style={{height: "20px"}}></div>
</Card>
</Container>
</div>}

<Container className="text-center how-to-play-heading">How to Play</Container>
<br/>
<Container className="text-center how-to-play-text">Simply enter to have a chance of winning the banana jackpot. One winner is picked using the Chainlink secure random number generator. When the draw is made check your wallet to find out if you're the lucky ape this time around!</Container>
<br/><Container>
<Row xs={1} md={3} className="g-4">
<Card>
  <Card.Header className="card-header text-center">Step 1</Card.Header>
    <Card.Body>
      <Card.Title>Enter Round</Card.Title>
      <Card.Text className="how-to-play-text">
        Enter the current round, the fee to play is currently set at 2 banana. Users can only enter once per round to allow for a fairer draw
      </Card.Text>
    </Card.Body>
  </Card>
  <Card>
  <Card.Header className="card-header text-center">Step 2</Card.Header>
    <Card.Body>
      <Card.Title>Await Draw</Card.Title>
      <Card.Text className="how-to-play-text">
        The winner will be drawn on the next draw date. This will be picked using the Chainlink secure random number generator function built into the banana lottery smart contract
      </Card.Text>
    </Card.Body>
  </Card>
  <Card>
  <Card.Header className="card-header text-center">Step 3</Card.Header>
    <Card.Body>
      <Card.Title>Check Wallet</Card.Title>
      <Card.Text className="how-to-play-text">
        The winner will be sent the total banana jackpot lottery directly to their wallet. The winning results will also be shown here on the site. Good luck apes!
      </Card.Text>
    </Card.Body>
  </Card>
</Row>
<hr/>
<div className="how-to-play-heading">About Banana Lottery</div>
<br/>
<div className="how-to-play-text">This is an unnoffical Banana Lottery created & ran by a community ape who wanted to give something back to the jungle. I've been a long
term Banana holder since the early days of February 2021. I know that a lot of the apemunity miss the official Banana Lottery so I decided to create my own lottery smart contract for Banana. <br/><br/>
The jackpot is built up by each player that enters the round so the total will depend on how many players enter. The fee to enter is currently set at 2 Banana but this can be altered in future if the commmunity wishes.<br/><br/>The links 
to the GitHub can be found at the bottom of the page in case any one wants to check over the content. I don't make any money from running this lottery but the smart contract does need to be funded with
BNB for gas & Link in order to fund the random number generation. If any apes out there are feeling super generous a little BNB or Banana can be donated to the following wallet as a kind gesture, this
will also help me keep the lottery funded: <br/><a href={"https://bscscan.com/address/0x729b0151d5a41472674F3C4a21de41eB4151f9B7"} target="_blank" rel="noopener noreferrer" className="bsc-link">0x729b0151d5a41472674F3C4a21de41eB4151f9B7<BsBoxArrowUpRight size={20} className="arrow-logo"></BsBoxArrowUpRight></a><br/>

</div>

</Container>




      <MyModal
        show={modalShow}
        onHide={hideModal}
        account={accounts[0]}
      />

<footer className="footer" style={{height: "70px", backgroundColor: "#fff"}}>
  <div className="container">
    <span className="text-muted">Place sticky footer content here.</span>
  </div>
</footer>




      
    </div>
  );
}

export default App;
