package digital.dnp.shared.api;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Gantt {
	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long id;
	
	String name; 
	String json;
	float pert;
	public float getPert() {
		return pert;
	}





	public void setPert(float pert) {
		this.pert = pert;
	}
	long timeStamp ;
	
	public Gantt(){
		timeStamp = System.currentTimeMillis();
	}

	
	
	
	
	public long getTimeStamp() {
		return timeStamp;
	}





	public void setTimeStamp(long timeStamp) {
		this.timeStamp = timeStamp;
	}





	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getJson() {
		return json;
	}
	public void setJson(String json) {
		this.json = json;
	} 
	
}
