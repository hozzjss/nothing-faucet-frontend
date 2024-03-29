import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { validateStacksAddress } from '@stacks/transactions';
import { Flex, Box, Text, Input, Button } from '@blockstack/ui';
const apiUrl = 'https://nothing-api.grtfl.art';
const getContractBalance = async () => {
  const contractBalance = await fetch(`${apiUrl}/faucet-balance`).then(res => res.json());
  return contractBalance;
};

const getNothings = async stxAddress => {
  const contractResult = await fetch(`${apiUrl}/faucet`, {
    method: 'POST',
    body: JSON.stringify({
      address: stxAddress,
    }),
    headers: {
      'content-type': 'application/json',
    },
  }).then(res => res.json());
  return contractResult;
};

const StackingResult = () => {
  const [result, setResult] = useState('');
  const [stxAddress, setStxAddress] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const isValidAddress = useMemo(() => stxAddress && validateStacksAddress(stxAddress), [
    stxAddress,
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const handleChange = useCallback(e => {
    setStxAddress(e.target.value);
  }, []);

  const [contractBalance, setContractBalance] = useState({
    stx: 0,
    nothings: 0,
  });

  useEffect(() => {
    getContractBalance().then(data => {
      setIsLoading(false);
      setContractBalance({
        stx: Math.floor(data.stx.balance / 1000000),
        nothings:
          data.fungible_tokens[
            'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.micro-nthng::micro-nothing'
          ].balance,
      });
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (isValidAddress) {
      setIsLoading(true);
      setResult('');
      setErrMsg('');
      getNothings(stxAddress)
        .then(result => {
          if (result.message) {
            setErrMsg(result.message);
          } else {
            setResult(result.txid);
          }
          setIsLoading(false);
        })
        .catch(async res => {
          console.log(res);
          setIsLoading(false);
        });
    }
  }, [stxAddress, isValidAddress]);
  return (
    <Flex>
      <Box maxWidth="660px" width="100%" mx="auto" mt="75px">
        <Flex width="100%" flexWrap="wrap">
          <Box mb={4} width="100%">
            <Input
              placeholder="Enter your stacks address here"
              onChange={handleChange}
              value={stxAddress}
            />
            {stxAddress && !isValidAddress && (
              <Text color="red" textStyle="caption">
                Invalid address
              </Text>
            )}
          </Box>
          <Box mb={4} width="100%">
            <Button disabled={isLoading || !isValidAddress} onClick={handleSubmit}>
              Get nothings
            </Button>
          </Box>
          <Box mb={4} width="100%">
            Contract has {contractBalance.stx} stacks
            <br />
            And {contractBalance.nothings} nothings
          </Box>
          {errMsg && !isLoading && (
            <>
              <Box fontWeight="bold" mb={4} width="100%">
                <Text fontWeight="bold" fontSize="display.medium" color="red">
                  {errMsg}
                </Text>
              </Box>
            </>
          )}
          {result && isValidAddress && !isLoading && (
            <>
              <Box fontWeight="bold" mb={4} width="100%">
                Transaction submitted:
                <a
                  target="_blank"
                  rel="noopener noreferrer "
                  href={`https://explorer.stacks.co/txid/${result}?chain=mainnet`}
                >
                  View here
                </a>
              </Box>
            </>
          )}

          <Box mb={4} width="100%">
            <Text size="display.medium" fontWeight="bold">
              Done doing nothing with nothings?
            </Text>
            <br />
            <Text size="display.medium" fontWeight="bold">
              Wanna donate stacks so nothing can keep on giving?
            </Text>
            <br />
            <Text size="display.medium" fontWeight="bold">
              Send to this address:
              <br />
              <a
                target="_blank"
                rel="noopener noreferrer "
                href={`https://explorer.stacks.co/address/SP31596TY1N33159BQCVEC9H16HP0KQ2VTD140157?chain=mainnet`}
              >
                SP31596TY1N33159BQCVEC9H16HP0KQ2VTD140157
              </a>{' '}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default StackingResult;
