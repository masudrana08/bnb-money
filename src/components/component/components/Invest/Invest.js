import React, { useEffect, useState } from 'react'
import Bnb from '../../assets/img/bnb.png'
import Web3 from "web3"
import Contract from 'web3-eth-contract';
import { ethers } from "ethers";
import { connectWallet, getWalletAddressOrConnect } from '../../../../wallet';
import './invest.css'
import { Row, Col } from 'react-bootstrap'
import Goal from '../../assets/img/goal.svg'
import NetWorth from '../../assets/img/networth.svg'
import Earning from '../../assets/img/earning.svg'
import Loss from '../../assets/img/loss.svg'
import Meter from '../../assets/img/speedometer.png'



var decimal = 1e18;
const abi = require('./abi.json')
const contractAddress = "0x6269Df1321fcEc2C5ABA171436396628016E74A0";

export default function Invest() {
    const [totalInvested, setTotalInvested] = useState(0)
    const [totalWithdrawals, setTotalWithdrawals] = useState(0)
    const [tokenReferralBonus, setTokenReferralBonus] = useState(0)
    const [totalRefsAmount, setTotalRefsAmount] = useState(0)
    const [userInvested, setUserInvested] = useState(0)
    const [userWithdrawn, setUserWithdrawn] = useState(0)
    const [income, setIncome] = useState(0)
    const [refReword, setRefReword] = useState(0)
    const [amount, setAmount] = useState(500)
    const bnbRate = 407.3593
    var contract
    useEffect(async () => {
        // fetch rate 
        // axios.get("http://api.coinlayer.com/api/live?access_key=8a302c7070cc40effd682b5a4e5a770f")
        //     .then(function (response) {
        //         console.log("cnvRates", response.data.rates.BNB)
        //         var cnvRateBNB = response.data.rates.BNB
        //         setBnbRate(cnvRateBNB)
        //     })




        // =====>coingeko 
        //2. Initiate the CoinGecko API Client
        // const CoinGeckoClient = new CoinGecko();

        // //3. Make calls
        // let data = await CoinGeckoClient.exchanges.all();
        // console.log("Data is ", data)


        if (typeof window.web3 !== 'undefined') {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            var web3Provider = new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org")
            window.web3 = new Web3(web3Provider)
        }
        Contract.setProvider(window.web3.currentProvider);
        contract = new Contract(abi, contractAddress);
        console.log(contract.methods)
        fetchContractData()
    }, [])
    const getContract = () => {
        if (typeof window.web3 !== 'undefined') {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            var web3Provider = new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org")
            window.web3 = new Web3(web3Provider)
        }
        Contract.setProvider(window.web3.currentProvider);
        return contract = new Contract(abi, contractAddress);
    }
    const fetchContractData = async () => {
        var myContract = await getContract()
        console.log("contract  is:  ", myContract)
        setTotalInvested(await contract.methods.totalInvested().call() / decimal)
        console.log("Total Invested : ", await myContract.methods.totalInvested().call() / decimal)

        var tWithdrawals = await contract.methods.totalWithdrawals().call() / decimal
        setTotalWithdrawals(tWithdrawals);
        console.log("Total withdrawal : ", tWithdrawals)

    }

    const fetchUserData = async () => {
        var account = await getWalletAddressOrConnect()
        document.getElementById("connect_btn").innerHTML = "Wallet Connected"
        var myContract = await getContract()
        console.clear()
        console.log("Contrac  is : ", myContract)
        var getRefsAmount = await myContract.methods.getRefsAmount(account).call({ from: account })

        var tUserRefsAmount = (Number(getRefsAmount[0]) + Number(getRefsAmount[1]) + Number(getRefsAmount[2])
            + Number(getRefsAmount[3]) + Number(getRefsAmount[4])) / decimal;
        setTotalRefsAmount(tUserRefsAmount);
        console.log("Total refsAmount : ", tUserRefsAmount)


        var account = await getWalletAddressOrConnect()
        var allDeposits = await contract.methods.getAllDeposits(account).call();
        console.log("User  deposit is  : ", allDeposits);

        var userInvested = 0;
        for (var i = 0; i < 10; i++) {
            userInvested = userInvested + Number(allDeposits[i][0]);
        }
        userInvested = userInvested / decimal;
        console.log("Total invested is : (userinvested) ", userInvested);
        setUserInvested(userInvested.toFixed(3));

        var userWithdrawn = 0
        for (var i = 0; i < 10; i++) {
            userWithdrawn = userWithdrawn + Number(allDeposits[i][2]);
            console.log("wamount is : ", userWithdrawn + Number(allDeposits[i][2]))
        }
        userWithdrawn = userWithdrawn / decimal;
        console.log("Total  withdrawal is : ", userWithdrawn);
        setUserWithdrawn(userWithdrawn.toFixed(3));

        var calculateIncome = Number(await contract.methods.calculateReward(account).call()) / decimal;
        setIncome(calculateIncome)
        console.log("User Income is ", calculateIncome);


        var getRefsAmount = await contract.methods.getRefsAmount(account).call();
        console.log("get all ref amount ", getRefsAmount);
        var totalUserRefsAmount = (Number(getRefsAmount[0]) + Number(getRefsAmount[1]) + Number(getRefsAmount[2])
            + Number(getRefsAmount[3]) + Number(getRefsAmount[4])) / decimal;
        console.log("totalUserRefsAmount is ", totalUserRefsAmount);
        setRefReword(totalUserRefsAmount);

        // makeRefLink

        var origin = window.location.origin;
        var refLink = origin + '?ref=' + account
        console.log("my ref Link is  ", refLink);
        document.getElementById("referralLink").value = refLink
    }

    async function invest() {
        var account = await getWalletAddressOrConnect()
        var myContract = await getContract()
        console.clear()

        var user = '0x0000000000000000000000000000000000000000';
        let searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('ref')) {
            user = searchParams.get('ref');
        }

        var tx = await myContract.methods.newDeposit(user).send({ from: account, value: ethers.utils.parseEther(amount) });
        console.log("transection hash is ", tx)

        // makeRefLink();
    }

    async function claim() {

        var account = await getWalletAddressOrConnect()
        var myContract = await getContract()
        console.clear()
        var tx = await myContract.methods.getRewardAll().call();
        console.log("Reward transection is ", tx)
        alert("Reward claimed !")
    }
    return (
        <div className='invest' id='invest'>
            <div className="container">
                <Row>
                    <Col md={4} className='invest__left'>
                        <div className='goalCont'>
                            <div>
                                <img style={{ width: '60px', background: 'rgba(31, 105, 255, 0.1)', padding: '5px', borderRadius: '10px' }} src={Goal} alt="" />
                            </div>
                            <div className='d-flex'>
                                <button className='prepend__btn'>BNB</button>
                                <input onChange={e => setAmount(e.target.value)} id="investAmount" type="number" name="invest" placeholder="500" step="" value={amount} />

                            </div>
                        </div>
                        <div>
                            <div>
                                <img style={{ width: '60px', background: 'rgba(4, 196, 14, 0.1)', padding: '8px', borderRadius: '10px' }} src={NetWorth} alt="" />
                            </div>
                            <div>
                                <p className='invest__subtitle'>Daily ROI</p>
                                <h3 className="invest__number">10%</h3>
                            </div>

                        </div>
                        <div>
                            <div>
                                <img style={{ width: '60px', background: 'rgba(232, 9, 43, 0.1)', padding: '8px', borderRadius: '10px' }} src={Earning} alt="" />
                            </div>
                            <div>
                                <p className='invest__subtitle'>Total Profit</p>
                                <h3 className="invest__number">300%</h3>
                            </div>

                        </div>
                        <div>
                            <div>
                                <img style={{ width: '60px', background: 'rgba(9, 20, 232, 0.1)', padding: '8px', borderRadius: '10px' }} src={Loss} alt="" />
                            </div>
                            <div>
                                <p className='invest__subtitle'>In 30 days, You'll Earn</p>
                                <h3 className="invest__number">{amount * 3} BNB</h3>
                            </div>
                        </div>
                        <div>
                            <button className='stake__btn' onClick={e => { invest() }}>
                                Stake
                            </button>
                        </div>
                    </Col>
                    <Col md={8}>
                        <div>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '20px' }}> YOUR ACCOUNT </h3>
                        </div>
                        <Row>
                            <Col className='account__left ' md={6}>
                                <div className='mb-5'>
                                    <div>
                                        <p className='invest__subtitle mb-2'>Individual Account</p>
                                        <h4 className="invest__number">Build Wealth</h4>
                                    </div>
                                    <div>
                                        <p className='invest__subtitle mb-2'>Current Balance</p>
                                        <h4 className="invest__number">$1248.90</h4>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <button className='claim__button' onClick={e => { claim() }}>Claim</button>
                                    </div>
                                    <div>
                                        <p className='invest__subtitle mb-2'>BNB to Claim</p>
                                        <h4 className="invest__number">130,000</h4>
                                    </div>
                                </div>
                                <div>
                                    <h6 className="invest__number">Your Goal</h6>
                                </div>
                                <div className='justify-content-between'>
                                    <p className="invest__subtitle">What you have invested</p>
                                    <h6 className='invest__number'>$1000.00</h6>
                                </div>
                                <div className='justify-content-between'>
                                    <p className="invest__subtitle">What you have earned</p>
                                    <h6 className='invest__number'>$3000.00</h6>
                                </div>
                            </Col>
                            <Col className='account__right mx-auto' md={5}>
                                <div className='d-flex justify-content-between'>
                                    <div>
                                        <p className='invest__subtitle mb-2'>Daily Return</p>
                                        <h4 className="invest__number">10%</h4>
                                    </div>
                                    <div>
                                        <p className='invest__subtitle mb-2'>Total Profit</p>
                                        <h4 className="invest__number">300%</h4>
                                    </div>
                                </div>
                                <div>
                                    <img style={{ width: '100%', marginTop: '20px' }} src={Meter} alt="" />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <h5 className="invest__number mb-3">Lifetime Returns</h5>
                            <Col md={6}>
                                <div className='d-flex justify-content-between'>
                                    <h6 style={{fontWeight:'600'}}>Total Stake Volume</h6>
                                    <p className='invest__subtitle mb-2'>4%</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <h6 style={{fontWeight:'600'}}>Total Reinvestment Volume</h6>
                                    <p className='invest__subtitle mb-2'>13%</p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <h6 className='invest__number'>Auto Deposite on May 25</h6>
                                    <p className='invest__subtitle mb-2'>250 BNB</p>
                                </div>
                            </Col>
                            <Col md={6}>
                            <div className='d-flex justify-content-between'>
                                    <h6 style={{fontWeight:'600'}}>Total Claim Reward</h6>
                                    <p className='invest__subtitle mb-2'>100.98 BNB</p>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <h6 style={{fontWeight:'600'}}>Contract Balance</h6>
                                    <p className='invest__subtitle mb-2'>187.85 BNB</p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <h6 className='invest__number'>Insurance Pool</h6>
                                    <p className='invest__subtitle mb-2'>987.85 BNB</p>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>

            </div>
        </div>
    )
    // return (
    //     <div>
    //         <section className="invest" id="invest">
    //             <div className="container">
    //                 <div className="section-title" style={{ display: 'flex', alignItems: 'center', columnGap: '20px' }}>
    //                     <h2 onClick={e => fetchContractData()}>
    //                         TIME to INVEST
    //                     </h2>
    //                     <img style={{ width: '3.5rem' }} src={Bnb} alt="" />
    //                 </div>
    //                 <div className="invest-block f-jcsb">
    //                     <div className="invest-wrap">
    //                         <ul className="invest-list">
    //                             <li className="invest-list__item">
    //                                 <h3 className="invest-list__title">
    //                                     Total Invested
    //                                 </h3>
    //                                 <p className="invest-list__value"><span id="totalInvested"></span>
    //                                     {totalInvested}BNB
    //                                 </p>
    //                                 <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#565454', marginTop: '10px' }}>
    //                                     {bnbRate !== null ? totalInvested * bnbRate : ''}$
    //                                 </p>
    //                             </li>
    //                             <li className="invest-list__item">
    //                                 <h3 className="invest-list__title">
    //                                     Total Withdrawals
    //                                 </h3>
    //                                 <p className="invest-list__value"><span id="totalWithdrawals"></span>
    //                                     {totalWithdrawals}BNB
    //                                 </p>
    //                                 <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#565454', marginTop: '10px' }}>
    //                                     {bnbRate !== null ? totalWithdrawals * bnbRate : ''}$
    //                                 </p>
    //                             </li>
    //                             <button id="connect_btn" className="btn btn-primary main-btn main-btn_blue" onClick={e => fetchUserData()} >Connect Wallet</button>
    //                         </ul>
    //                         <div className="invest-bottom">
    //                             <div className="invest-connect">
    //                                 <span className="invest-connect__token f-center-center">
    //                                     BNB
    //                                 </span>

    //                                 <input onChange={e => setAmount(e.target.value)} id="investAmount" type="number" name="invest" placeholder="500" step="" />
    //                                 <button onClick={e => { invest() }} className="main-btn main-btn_blue invest-connect__btn">
    //                                     Invest Now
    //                                 </button>
    //                             </div>
    //                             <p className="invest-text">
    //                                 * 0.05 BNB Minimum Deposit
    //                             </p>
    //                         </div>
    //                     </div>
    //                     <div className="invest-wrap">
    //                         <ul className="invest-list invest-list_accent">
    //                             <li className="invest-list__item">
    //                                 <h3 className="invest-list__title">
    //                                     Your Total Deposits
    //                                 </h3>
    //                                 <p className="invest-list__value"><span id="userInvested"></span>
    //                                     {userInvested}  BNB
    //                                 </p>
    //                                 <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#565454', marginTop: '10px' }}>
    //                                     {bnbRate !== null ? userInvested * bnbRate : ''}$
    //                                 </p>
    //                             </li>
    //                             <li className="invest-list__item">
    //                                 <h3 className="invest-list__title">
    //                                     Your Withdrawals
    //                                 </h3>
    //                                 <p className="invest-list__value"><span id="userWithdrawn"></span>
    //                                     {userWithdrawn} BNB
    //                                 </p>
    //                                 <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#565454', marginTop: '10px' }}>
    //                                     {bnbRate !== null ? userWithdrawn * bnbRate : ''}$
    //                                 </p>
    //                             </li>
    //                             <li className="invest-list__item">
    //                                 <h3 className="invest-list__title">
    //                                     Your Income
    //                                 </h3>
    //                                 <p className="invest-list__value"><span id="calculateReward"></span>
    //                                     {income} BNB
    //                                 </p>
    //                                 <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#565454', marginTop: '10px' }}>
    //                                     {bnbRate !== null ? income * bnbRate : ''}$
    //                                 </p>
    //                             </li>
    //                             <li className="invest-list__item">
    //                                 <h3 className="invest-list__title">
    //                                     Referral Rewards
    //                                 </h3>
    //                                 <p className="invest-list__value"><span id="totalUserRefsAmount"></span>
    //                                     {totalRefsAmount} BNB
    //                                 </p>
    //                                 <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#565454', marginTop: '10px' }}>
    //                                     {bnbRate !== null ? totalRefsAmount * bnbRate : ''}$
    //                                 </p>
    //                             </li>
    //                         </ul>
    //                         <div className="invest-bottom">
    //                             <div className="invest-offer f-center">
    //                                 <button onClick={e => { claim() }} type="button" className="main-btn">
    //                                     Claim
    //                                 </button>
    //                             </div>
    //                             <p className="invest-text">
    //                                 * 0.05 BNB Minimum Amount
    //                             </p>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className="invest-theme">
    //                     Profit
    //                 </div>
    //                 {/* <div className="invest-circle rotate-circle">
    //                     <img src={BnbCircle} alt="" />
    //                 </div> */}
    //             </div>
    //         </section>
    //     </div>
    // )
}
