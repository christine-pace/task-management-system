using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagementSystemBackend.Data;
using TaskManagementSystemBackend.Model;

namespace TaskManagementSystemBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;
        private readonly ILogger<TaskController> _logger;

        public TaskController(AppDbContext appDbContext, ILogger<TaskController> logger)
        {
            _appDbContext = appDbContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            _logger.LogDebug("Getting tasks...");
            try
            {
                // Obtain all tasks
                var tasks = await _appDbContext.Tasks.ToListAsync();
                
                // Check if there are any tasks available
                if (!tasks.Any())
                    return NoContent();

                return tasks;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetTasks: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            _logger.LogDebug("Getting task...");
            try
            {
                // Obtain task using id
                var task = await _appDbContext.Tasks.FindAsync(id);

                // Check if task exist
                if (task == null)
                    return NotFound("Task was not found.");

                return task;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetTask: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask(TaskItem taskItem)
        {
            // Validate task item
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            _logger.LogDebug("Creating task...");

            try
            {
                // Add task item to database
                _appDbContext.Tasks.Add(taskItem);
                await _appDbContext.SaveChangesAsync();

                return CreatedAtAction(nameof(GetTask), new { id = taskItem.Id }, taskItem);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in CreateTask: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody]TaskItem updateTask)
        {
            // Validate task item
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            _logger.LogDebug("Updating task...");

            try
            {
                // Check id matches task to be updated
                if (id != updateTask.Id)
                    return BadRequest("Id does not match task to update.");

                // Obtain task using id
                var task = await _appDbContext.Tasks.FindAsync(id);
                if (task == null)
                    return NotFound("Task to update was not found.");

                // Update values
                task.Title = updateTask.Title;
                task.Description = updateTask.Description;
                task.IsCompleted = updateTask.IsCompleted;
                task.DateUpdated = DateTime.Now;

                // Update item in database
                await _appDbContext.SaveChangesAsync();
                return Ok("Task Updated Successful.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in UpdateTask: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            _logger.LogDebug("Deleting task...");

            try
            {
                // Obtain task using id
                var task = await _appDbContext.Tasks.FindAsync(id);

                // Check if task exist
                if (task == null)
                    return NotFound("Task to delete was not found.");

                // Delete task from database
                _appDbContext.Tasks.Remove(task);
                await _appDbContext.SaveChangesAsync();
                return Ok("Task Deleted Successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in DeleteTask: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }
    }

}
