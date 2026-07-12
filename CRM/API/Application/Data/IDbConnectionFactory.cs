using System.Data;

namespace OrbeB2B.Crm.Application.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}