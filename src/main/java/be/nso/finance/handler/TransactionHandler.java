package be.nso.finance.handler;

import be.nso.finance.domain.Transaction;
import be.nso.finance.repository.TransactionRepository;
import be.nso.finance.handler.security.Admin;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.appengine.api.users.User;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.List;

@Api(name = "nsofinance", version = "v1",
		clientIds = {"1047276749895-gtdmqkb8rjcp70ua3q8ab471gnin4o83.apps.googleusercontent.com", "292824132082.apps.googleusercontent.com"},
		scopes = {"https://www.googleapis.com/auth/userinfo.email"})
public class TransactionHandler {

	@Inject
	private TransactionRepository transactionRepository;

	public TransactionHandler() {
	}

	@ApiMethod(name = "transaction.list", path = "transaction")
	public List<Transaction> listTransactions() {
		return transactionRepository.list();
	}

	@Admin
	@ApiMethod(name = "transaction.save", path = "transaction", httpMethod = HttpMethod.POST)
	public void save(Transaction transaction, User user) {
		transactionRepository.save(transaction);
	}

	@Admin
	@ApiMethod(name = "transaction.remove", path = "transaction/{id}", httpMethod = HttpMethod.DELETE)
	public void remove(@Named("id") long id, User user) {
		transactionRepository.remove(id);
	}
}
