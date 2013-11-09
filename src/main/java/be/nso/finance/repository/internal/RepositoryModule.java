package be.nso.finance.repository.internal;

import be.nso.finance.repository.TransactionRepository;
import com.google.inject.AbstractModule;

import javax.inject.Singleton;

public class RepositoryModule extends AbstractModule {
	@Override
	protected void configure() {
		bind(TransactionRepository.class).to(TransactionRepositoryImpl.class).in(Singleton.class);
	}
}
