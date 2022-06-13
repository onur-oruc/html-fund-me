// in nodejs -> require()

// in frontend -> require WONT work. Use import instead
import { ethers } from './ethers-5.6.esm.min.js';
import { abi, fundMeContractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const withdrawButton = document.getElementById('withdrawButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

async function connect() {
	if (typeof window.ethereum !== 'undefined') {
		console.log('MetaMask indeed');
		window.ethereum.request({ method: 'eth_requestAccounts' });
	}
}

async function fund() {
	const ethAmount = document.getElementById('ethAmount').value;
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner(); // wallet that connected to the wallet
		const contract = new ethers.Contract(fundMeContractAddress, abi, signer);
		try {
			const transactionResponse = await contract.fund({
				value: ethers.utils.parseEther(ethAmount),
			});
			// wait for this tx to finish
			await listenForTransactionMine(transactionResponse, provider);
			console.log(
				'Done!: This should be printed on the console after the console.log statement inside the listerForTransactionMine function is logged'
			);
		} catch (error) {
			console.log(error);
		}
	}
}

async function withdraw() {
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(fundMeContractAddress, abi, signer);
		try {
			const transactionResponse = await contract.cheaperWithdraw();
			await listenForTransactionMine(transactionResponse, provider);
		} catch (e) {
			console.log(e);
		}
	}
}

async function getBalance() {
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contractBalance = await provider.getBalance(fundMeContractAddress);
		const balance = await signer.getBalance();
		console.log(
			'contract balance: ' + ethers.utils.formatEther(contractBalance) + ' ETH'
		);
		console.log(
			'wallet balance: ' + ethers.utils.formatEther(balance) + ' ETH'
		);
	} else {
		console.log('window.ethereum is undefined');
	}
}

function listenForTransactionMine(transactionResponse, provider) {
	console.log('Mining hash: ' + transactionResponse.hash + '...');
	// listern for this tx finish
	// ONCE the transactionResponse object has an "hash" attribute,
	// it returns transactionReceipt to the listener function which is
	// the ananymous function (second parameter of provider.once)
	return new Promise((resolve, reject) => {
		provider.once(transactionResponse.hash, (transactionReceipt) => {
			console.log(
				'Completed with ' + transactionReceipt.confirmations + ' confirmations'
			);
			resolve();
		});
	});
}
