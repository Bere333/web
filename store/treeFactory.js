import web3 from '~/plugins/web3'
import TreeFactory from '~/contracts/TreeFactory'
import web3Abi from 'web3-eth-abi'
import { BToast } from 'bootstrap-vue'



const tokenAddress = process.env.contractTreeFactoryAddress // insert deployed TreeFactory token address here
const treeFactory = new web3.eth.Contract(TreeFactory.abi, tokenAddress)

let account
web3.eth.getAccounts().then(res => {
  account = res[0]
})

export const state = () => ({})

export const mutations = {}

export const actions = {
  getMyTreeCount() {
    return treeFactory.methods.ownerTreesCount(account).call({ from: account });
  },
  getTree(context, params) {
    return treeFactory.methods.getTree(params.id).call({ from: account })
      .then((treeData) => {
        treeData.latitude = parseFloat(treeData.latitude)
        treeData.longitude = parseFloat(treeData.longitude)
        return treeData;
      });
  },
  getOwnerTreesId() {
    return treeFactory.methods.getOwnerTrees(account).call({ from: account });
  },
  getPrice() {
    return treeFactory.methods.price().call({ from: account })
      .then((treeWeiPrice) => web3.utils.fromWei(treeWeiPrice));
  },
  async plant(context, params) {
    const plantMethod = TreeFactory.abi.find(method => {
      return method.name === 'add'
    })


    // function add(
    // 	uint8 _typeId,
    // 	uint256 _gbId,
    // 	string[] calldata _stringParams,
    // 	uint8[] calldata _uintParams
    // ) external {
    // 	struct Tree {
    // 		string name;
    // 		string latitude;
    // 		string longitude;
    // 		uint256 plantedDate;
    // 		uint256 birthDate;
    // 		uint256 fundedDate;
    // 		uint8 height;
    // 		uint8 diameter;
    // 		uint256 balance;
    // 	}
    // 	trees.push(
    // 		Tree(
    // 			_stringParams[0],
    // 			_stringParams[1],
    // 			_stringParams[2],
    // 			now,
    // 			now,
    // 			0,
    // 			_uintParams[0],
    // 			_uintParams[1],
    // 			0
    // 		)
    // 	);



    const plantMethodTransactionData = web3Abi.encodeFunctionCall(
      plantMethod,
      ['0', '0', ['firstTreeWeb3', '41.0157464', '28.6614805'], ['10', '20']]
    )

    const estimateGas = await web3.eth.estimateGas({
      from: account,
      to: tokenAddress,
      data: plantMethodTransactionData
    })

    const receipt = await web3.eth.sendTransaction({
      from: account,
      to: tokenAddress,
      data: plantMethodTransactionData,
      value: 0,
      gas: estimateGas * 2
    })

    return receipt
  },

  async getEthBalance() {
    return await web3.eth.getBalance(account).then((ethBalance) => {
      const test = web3.utils.fromWei(ethBalance)
      const ethBalances = parseFloat(test).toFixed(4)
      return ethBalances
    });
  },
  async fund(context, params) {
    let self = this
    const fundMethod = TreeFactory.abi.find(method => {
      return method.name === 'fund'
    })

    const fundMethodTransactionData = web3Abi.encodeFunctionCall(
      fundMethod,
      [params.count]
    )
    // const estimateGas = await web3.eth.estimateGas({
    // 	from: account,
    // 	to: tokenAddress,
    // 	data: fundMethodTransactionData
    // })



    try {
      const receipt = await web3.eth.sendTransaction({
        from: account,
        to: tokenAddress,
        data: fundMethodTransactionData,
        value: web3.utils.toWei('0.01') * params.count,
        // gas: estimateGas * 4
      }).on('transactionHash', (resolve) => {
        let bootStrapToaster = new BToast();
        bootStrapToaster.$bvToast.toast(['Check progress on Etherscan'], {
          toaster: 'b-toaster-bottom-left',
          title: 'Processing payment...',
          variant: 'warning',
          href: `https://ropsten.etherscan.io/address/${self.$cookies.get('account')}`,
          bodyClass: 'fund-error',
          noAutoHide: true

        })
      })
        .on('error', (error) => {
          const bootStrapToaster = new BToast();

          console.log(error, 'this here')
          if (error.code === 32602) {
            bootStrapToaster.$bvToast.toast(['You don\'t have enough Ether (ETH)'], {
              toaster: 'b-toaster-bottom-left',
              title: 'Payment failed',
              variant: 'danger',
              to: '/forest/addTree',
              noAutoHide: true,
              bodyClass: 'fund-error'
            })
          } else {
            bootStrapToaster.$bvToast.toast(['You rejected the request'], {
              toaster: 'b-toaster-bottom-left',
              title: 'Payment failed',
              variant: 'danger',
              to: '/forest/addTree',
              noAutoHide: true,
              bodyClass: 'fund-error'
            })
          }


          return null

        })

      return receipt

    } catch (error) {
      return null;
    }

  }
}

export const getters = {}
