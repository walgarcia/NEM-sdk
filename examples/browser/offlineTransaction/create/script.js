$(document).ready(function () {

	// Load nem-browser library
	var nem = require("nem-sdk").default;

	// Get an empty un-prepared transfer transaction object
	var transferTransaction = nem.model.objects.get("transferTransaction");

	// Get an empty common object to hold pass and key
	var common = nem.model.objects.get("common");

	// Set default amount in view. It is text input so we can handle dot and comma as decimal mark easily (need cleaning but provided by the library)
	$("#amount").val("0");

	/**
     * Function to update our fee in the view
     */
	function updateFee() {
		// Check for amount errors
		if(undefined === $("#amount").val() || !nem.utils.helpers.isTextAmountValid($("#amount").val())) return alert('Invalid amount !');

		// Set the cleaned amount into transfer transaction object
		transferTransaction.amount = nem.utils.helpers.cleanTextAmount($("#amount").val());

		// Set the message into transfer transaction object
		transferTransaction.message = $("#message").val();

		// Prepare the updated transfer transaction object
		var transactionEntity = nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.testnet.id);

		// Format fee returned in prepared object
		var feeString = nem.utils.format.nemValue(transactionEntity.fee)[0] + "." + nem.utils.format.nemValue(transactionEntity.fee)[1];

		//Set fee in view
		$("#fee").html(feeString);
	}

	/**
     * Build transaction from form data
     */
	function create() {
		// Check form for errors
		if(!$("#privateKey").val() || !$("#recipient").val()) return alert('Missing parameter !');
		if(undefined === $("#amount").val() || !nem.utils.helpers.isTextAmountValid($("#amount").val())) return alert('Invalid amount !');
		if (!nem.model.address.isValid(nem.model.address.clean($("#recipient").val()))) return alert('Invalid recipent address !');

		// Set the private key in common object
		common.privateKey = $("#privateKey").val();

		// Check private key for errors
		if (common.privateKey.length !== 64 && common.privateKey.length !== 66) return alert('Invalid private key, length must be 64 or 66 characters !');
    	if (!nem.utils.helpers.isHexadecimal(common.privateKey)) return alert('Private key must be hexadecimal only !');

		// Set the cleaned amount into transfer transaction object
		transferTransaction.amount = nem.utils.helpers.cleanTextAmount($("#amount").val());

		// Recipient address must be clean (no hypens: "-")
		transferTransaction.recipient = nem.model.address.clean($("#recipient").val());

		// Set message
		transferTransaction.message = $("#message").val();

		// Prepare the updated transfer transaction object
		var transactionEntity = nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.testnet.id);

		// Create a key pair object from private key
		var kp = nem.crypto.keyPair.create(nem.utils.helpers.fixPrivateKey(common.privateKey));

		// Serialize the transaction
		var serialized = nem.utils.serialization.serializeTransaction(transactionEntity);

		// Sign the serialized transaction with keypair object
	    var signature = kp.sign(serialized);

	    // Build the object to send
	    var result = {
	        'data': nem.utils.convert.ua2hex(serialized),
	        'signature': signature.toString()
	    };

	    // Show the object to send in view
	    $("#result").val(JSON.stringify(result));
	}

	// On amount change we update fee in view
	$("#amount").on('change keyup paste', function() {
	    updateFee();
	});

	// On message change we update fee in view
	$("#message").on('change keyup paste', function() {
	    updateFee();
	});

	// Call send function when click on send button
	$("#create").click(function() {
	  create();
	});

	// Initialization of fees
	updateFee();

});