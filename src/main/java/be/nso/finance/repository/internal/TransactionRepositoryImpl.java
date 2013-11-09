package be.nso.finance.repository.internal;

import be.nso.finance.domain.Transaction;
import be.nso.finance.repository.TransactionRepository;

import javax.inject.Singleton;

@Singleton
class TransactionRepositoryImpl extends BaseRepositoryImpl<Transaction> implements TransactionRepository {

	public TransactionRepositoryImpl() {
		super(Transaction.class);
	}
}
