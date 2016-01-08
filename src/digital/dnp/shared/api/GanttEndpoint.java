package digital.dnp.shared.api;

import digital.dnp.shared.api.EMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JPACursorHelper;

import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.persistence.EntityManager;
import javax.persistence.Query;

@Api(name = "ganttendpoint", namespace = @ApiNamespace(ownerDomain = "dnp.digital", ownerName = "dnp.digital", packagePath = "shared.api") )
public class GanttEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listGantt")
	public CollectionResponse<Gantt> listGantt(@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		EntityManager mgr = null;
		Cursor cursor = null;
		List<Gantt> execute = null;

		try {
			mgr = getEntityManager();
			Query query = mgr.createQuery("select from Gantt as Gantt");
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				query.setHint(JPACursorHelper.CURSOR_HINT, cursor);
			}

			if (limit != null) {
				query.setFirstResult(0);
				query.setMaxResults(limit);
			}

			execute = (List<Gantt>) query.getResultList();
			cursor = JPACursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Gantt obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Gantt> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getGantt")
	public Gantt getGantt(@Named("id") Long id) {
		EntityManager mgr = getEntityManager();
		Gantt gantt = null;
		try {
			gantt = mgr.find(Gantt.class, id);
		} finally {
			mgr.close();
		}
		return gantt;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param gantt the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertGantt")
	public Gantt insertGantt(Gantt gantt) {
		EntityManager mgr = getEntityManager();
		try {
			if (containsGantt(gantt)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.persist(gantt);
		} finally {
			mgr.close();
		}
		return gantt;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param gantt the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateGantt")
	public Gantt updateGantt(Gantt gantt) {
		EntityManager mgr = getEntityManager();
		try {
			if (!containsGantt(gantt)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.persist(gantt);
		} finally {
			mgr.close();
		}
		return gantt;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeGantt")
	public void removeGantt(@Named("id") Long id) {
		EntityManager mgr = getEntityManager();
		try {
			Gantt gantt = mgr.find(Gantt.class, id);
			mgr.remove(gantt);
		} finally {
			mgr.close();
		}
	}

	private boolean containsGantt(Gantt gantt) {
		EntityManager mgr = getEntityManager();
		boolean contains = true;
		try {
			if(gantt.getId() == null) return false;
			Gantt item = mgr.find(Gantt.class, gantt.getId());
			if (item == null) {
				contains = false;
			}
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static EntityManager getEntityManager() {
		return EMF.get().createEntityManager();
	}

}
