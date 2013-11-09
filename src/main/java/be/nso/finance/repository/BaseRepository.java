package be.nso.finance.repository;

import java.util.List;

public interface BaseRepository<T> {

	List<T> list();

	T save(T entity);

	void remove(long id);
}
