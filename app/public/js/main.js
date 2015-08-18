function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}


$(document).ready(function () {
    var connectedInterval;
    $('#pnl_client,#pnl_connected').matchHeight();
    $('#frm_client').submit(function () {
        var url = $('#client_url').val();
        web3.setProvider(new web3.providers.HttpProvider(url));

        function updateConnected() {
            if (web3.isConnected()) {
                $('#connected_version').html(web3.version.client);
                $('#connected_block').html(web3.eth.blockNumber);
                var gasPrice = web3.eth.gasPrice.toString();
                $('#connected_gasprice').html(gasPrice);
                //$('#tx_gasprice').val(gasPrice);
            }
        }
        connectedInterval = setInterval(updateConnected, 2000);
        updateConnected();
        return false;
    });
    $('#frm_presale').submit(function () {
        try {
            var password = $('#presale_password').val();
            var files = $('#presale_file')[0].files;
            var reader = new FileReader();
            reader.onload = function (event) {
                try {
                    var jsonText = event.target.result;
                    var json = JSON.parse(jsonText);
                    if (json) {
                        var password_iterated = CryptoJS.PBKDF2(password, password, {
                            iterations: 2000,
                            hasher: CryptoJS.algo.SHA256
                        });
                        var seed = CryptoJS.AES.decrypt({
                            ciphertext: CryptoJS.enc.Hex.parse(json.encseed.substring(32)),
                            salt: ''
                        }, password_iterated, {iv: CryptoJS.enc.Hex.parse(json.encseed.substring(0, 32))});
                        var eth_priv = CryptoJS.SHA3(seed.toString(CryptoJS.enc.Utf8), {outputLength: 256});
                        var d = bitcoinlibs.BigInteger.fromHex(eth_priv.toString());
                        var Q = bitcoinlibs.bitcoin.ECKey.curve.G.multiply(d);
                        var encoded = Q.affineX.toHex() + Q.affineY.toHex();
                        var hex = CryptoJS.SHA3(CryptoJS.enc.Hex.parse(encoded), {outputLength: 256}).toString().substring(24);

                        if (hex == json.ethaddr) {
                            $('#presale_alert_success').show();
                            $('#presale_alert_failure').hide();
                            $('#presale_alert_success').html('Wallet loaded sucessfully! Address: ' + hex);

                            $('#tx_privatekey').val(eth_priv.toString());

                        } else {
                            throw new Error('Different address. Probably wrong password.');
                        }
                    }
                } catch (e) {
                    $('#presale_alert_success').hide();
                    $('#presale_alert_failure').show();
                    $('#presale_alert_failure').html('Failure loading wallet, error was: ' + e.message);
                }
            };
            reader.readAsText(files[0]);
        } catch (e) {
            $('#presale_alert_success').hide();
            $('#presale_alert_failure').show();
            $('#presale_alert_failure').html('Failure loading wallet, error was: ' + e.message);
        }
        return false;
    });
    $('#frm_tx').submit(function () {
        try {
            var eth_priv = $('#tx_privatekey').val();
            var privateKey = new Buffer(eth_priv.toString());
            var rawTx = {
                nonce: $('#tx_nonce').val(),
                gasPrice: $('#tx_gasprice').val(),
                gasLimit: $('#tx_gas').val(),
                to: $('#tx_to').val(),
                value: $('#tx_value').val(),
                data: $('#tx_data').val()
            };
            var tx = new EthTx(rawTx);
            tx.sign(privateKey);
            var serializedTx = tx.serialize();
            $('#send_tx').val(serializedTx.toString('hex'));
            $('#tx_save').prop('disabled', false);
            $('#tx_alert_success').show();
            $('#tx_alert_failure').hide();
        } catch (e) {
            $('#tx_alert_success').hide();
            $('#tx_alert_failure').show();
            $('#tx_alert_failure').html('Failure serializing transaction, error was: ' + e.message);
        }
        return false;
    });
    $('#frm_send').submit(function () {
        try {
            var serializedTx = $('#send_tx').val();

            web3.eth.sendRawTransaction(new EthTx(new Buffer(serializedTx)).serialize().toString('hex'), function (err, address) {
                if (!err) {
                    $('#send_alert_success').show();
                    $('#send_alert_failure').hide();
                } else {
                    $('#send_alert_success').hide();
                    $('#send_alert_failure').show();
                    $('#send_alert_failure').html('Failure sending transaction, error was: ' + err);
                }
            });

        } catch (e) {
            $('#send_alert_success').hide();
            $('#send_alert_failure').show();
            $('#send_alert_failure').html('Failure sending transaction, error was: ' + e.message);
        }
        return false;
    });
    $('#tx_save').click(function () {
        download($('#send_tx').val(), 'tx.frozeth', 'text/plain');
    });
    $('#send_file').change(function (e) {
            var files = $('#send_file')[0].files;
            if (!files) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (event) {
                try {
                    var txText = event.target.result;
                    $('#send_tx').val(txText);
                    fixSendTxSize();
                    var serializedTx = $('#send_tx').val();
                    var tx = new EthTx(new Buffer(serializedTx));
                    var json = tx.toJSON();
                    $('#tx_gas').val(json[2]);
                    $('#tx_nonce').val(json[0]);
                    $('#tx_gasprice').val(json[1]);
                    $('#tx_to').val(json[3]);
                    $('#tx_value').val(json[4]);
                    $('#tx_data').val(json[5]);
                } catch (e) {
                    $('#send_alert_success').hide();
                    $('#send_alert_failure').show();
                    $('#send_alert_failure').html('Failure sending transaction, error was: ' + e.message);
               }
            };
            reader.readAsText(files[0]);


    });
});