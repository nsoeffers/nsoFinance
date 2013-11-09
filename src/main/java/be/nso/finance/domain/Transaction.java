package be.nso.finance.domain;

import javax.persistence.*;
import java.util.Date;

@Entity
public class Transaction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long serverId;

	@Version
	private long version;

	private String description;

	@Temporal(TemporalType.DATE)
	private Date date;

	private float amount;

	@Temporal(TemporalType.TIMESTAMP)
	private Date modifiedOn;

	private String assignedBy;

	@SuppressWarnings("unused")
	private Transaction() { /*Used by JPA, JSON serializers*/ }

	public Transaction(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Long getServerId() {
		return serverId;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public float getAmount() {
		return amount;
	}

	public void setAmount(float amount) {
		this.amount = amount;
	}

	public Date getModifiedOn() {
		return modifiedOn;
	}

	public void setModifiedOn(Date modifiedOn) {
		this.modifiedOn = modifiedOn;
	}

	public String getAssignedBy() {
		return assignedBy;
	}

	public void setAssignedBy(String assignedBy) {
		this.assignedBy = assignedBy;
	}
}
