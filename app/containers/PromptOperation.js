// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import steem from 'steem';

import * as AccountActions from '../actions/account';
import * as KeysActions from '../actions/keys';
import * as ProcessingActions from '../actions/processing';

import OperationsForm from '../components/sign/operations/form'

const permissions = {
  active: [
    'account_update',
    'custom_json'
  ],
  posting: [
    'vote',
    'comment',
    'custom_json'
  ]
}

const accountFields = {
  'account_create': ['creator'],
  'account_create_with_delegation': ['creator'],
  'account_update': ['account'],
  'account_witness_proxy': ['account'],
  'account_witness_vote': ['account'],
  'cancel_transfer_from_savings': ['from'],
  'claim_reward_balance': ['account'],
  'comment': ['author'],
  'convert': ['owner'],
  'decline_voting_rights': ['account'],
  'delegate_vesting_shares': ['delegator'],
  'set_withdraw_vesting_route': ['from_account'],
  'transfer': ['from'],
  'transfer_from_savings': ['from'],
  'transfer_to_savings': ['from'],
  'transfer_to_vesting': ['from'],
  'vote': ['voter'],
  'withdraw_vesting': ['account'],
  'witness_update': ['owner'],
}

class PromptOperation extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: null,
      ops: JSON.parse(window.atob(props.query.ops)),
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.processing.account_custom_ops_resolved) {
      window.close()
    }
  }

  submitOps = (e) => {
    const { account, ops } = this.state
    const permissions = this.props.keys.permissions;
    this.props.actions.useKey('send', { operations: ops, extensions: [] }, permissions[account]);
    e.preventDefault()
  }

  modifyOpsByAccount(account) {
    const { ops } = this.state
    const modOps = ops.slice(0);
    const accountFieldTypes = Object.keys(accountFields)
    ops.forEach((op, idx) => {
      const opType = op[0]
      const opData = op[1]
      if(accountFieldTypes.indexOf(opType) > -1) {
        const modData = Object.assign({}, opData)
        accountFields[opType].forEach((field) => {
          modData[field] = account
        })
        modOps[idx] = [opType, modData]
      }
    })
    this.setState({
      account: account,
      ops: modOps
    })
  }

  render() {
    const { ops } = this.state
    const { keys } = this.props
    return (
      <OperationsForm
        processing={this.props.processing}
        accounts={keys.names}
        accountChange={this.modifyOpsByAccount.bind(this)}
        submitOps={this.submitOps.bind(this)}
        ops={ops}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    account: state.account,
    keys: state.keys,
    preferences: state.preferences,
    processing: state.processing
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...AccountActions,
      ...KeysActions,
      ...ProcessingActions
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PromptOperation);
