package be.nso.finance.repository.internal;

import be.nso.finance.repository.BaseRepository;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import java.util.List;

class BaseRepositoryImpl<T> implements BaseRepository<T> {

	private final Class<T> entityClass;

	@Inject
	private EntityManager entityManager;

	public BaseRepositoryImpl(Class<T> entityClass) {
		this.entityClass = entityClass;
	}

	public List<T> list() {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<T> query = criteriaBuilder.createQuery(entityClass);
		query.from(entityClass);
		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public T save(T entity) {
		entityManager.persist(entity);
		return entity;
	}

	@Override
	public void remove(long id) {
		entityManager.remove(entityManager.find(entityClass, id));
	}
}
